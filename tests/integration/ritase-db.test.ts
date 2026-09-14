import { PrismaClient } from '@prisma/client'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL wajib diisi untuk integration test Ritase.')
}

const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } })

async function resetRitaseData() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "AuditLog", "StockMovement", "Ritase", "Driver", "Unit", "Material", "Stockpile", "Vendor" CASCADE',
  )
}

async function createFixture() {
  const vendor = await prisma.vendor.create({
    data: {
      id: 'test-vendor',
      nama: 'Vendor Test',
      peran: 'Hauling & Barging',
      hargaPerRitase: 150000,
    },
  })

  const unit = await prisma.unit.create({
    data: {
      id: 'TEST-DT-001',
      nama: 'Dump Truck Test',
      tipe: 'DT',
      kategori: 'Dump Truck',
      kapasitasM3: 10,
      vendorId: vendor.id,
    },
  })

  const driver = await prisma.driver.create({
    data: {
      id: 'test-driver',
      nama: 'Driver Test',
      vendorId: vendor.id,
    },
  })

  const material = await prisma.material.create({
    data: {
      id: 'test-material',
      nama: 'Ore Test',
      density: 1.8,
      kadarDefault: 1.5,
    },
  })

  const stockpile = await prisma.stockpile.create({
    data: {
      id: 'test-stockpile',
      kode: 'TEST-01',
      kadar: 1.5,
      diAtasCOG: true,
    },
  })

  const ritase = await prisma.ritase.create({
    data: {
      id: `test-ritase-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      tanggal: new Date('2026-09-14T08:00:00.000Z'),
      unitId: unit.id,
      driverId: driver.id,
      vendorId: vendor.id,
      materialId: material.id,
      asal: 'Pit Test',
      stockpileId: stockpile.id,
      kapasitasM3: 10,
      density: 1.8,
      tonase: 18,
      kadar: 1.5,
      hargaPerRitase: 150000,
      nilai: 150000,
      tahapIndex: 1,
      status: 'MENUNGGU',
    },
  })

  return { ritase, stockpile }
}

describe('Ritase database business rules', () => {
  beforeAll(async () => {
    await prisma.$connect()
  })

  beforeEach(async () => {
    await resetRitaseData()
  })

  afterAll(async () => {
    await resetRitaseData()
    await prisma.$disconnect()
  })

  it('menolak validasi oleh role yang bukan pemilik tahap', async () => {
    const { ritase } = await createFixture()

    await expect(
      prisma.$queryRaw`SELECT setujui_ritase(${ritase.id}, ${'checker'}, ${'Checker Test'}, ${'test'})`,
    ).rejects.toThrow()

    const current = await prisma.ritase.findUniqueOrThrow({ where: { id: ritase.id } })
    expect(current.status).toBe('MENUNGGU')
    expect(current.tahapIndex).toBe(1)
  })

  it('validasi pengawas lalu checker mengubah status dan membuat stock movement atomik', async () => {
    const { ritase, stockpile } = await createFixture()

    await prisma.$queryRaw`SELECT setujui_ritase(${ritase.id}, ${'pengawas'}, ${'Pengawas Test'}, ${'test'})`
    let current = await prisma.ritase.findUniqueOrThrow({ where: { id: ritase.id } })
    expect(current.status).toBe('MENUNGGU')
    expect(current.tahapIndex).toBe(2)

    await prisma.$queryRaw`SELECT setujui_ritase(${ritase.id}, ${'checker'}, ${'Checker Test'}, ${'test'})`
    current = await prisma.ritase.findUniqueOrThrow({ where: { id: ritase.id } })
    expect(current.status).toBe('DISETUJUI')
    expect(current.tahapIndex).toBe(3)

    const movement = await prisma.stockMovement.findUnique({ where: { ritaseId: ritase.id } })
    expect(movement).not.toBeNull()
    expect(movement?.jenis).toBe('MASUK')
    expect(movement?.stockpileId).toBe(stockpile.id)
    expect(movement?.tonase).toBe(18)

    const auditCount = await prisma.auditLog.count({ where: { ritaseId: ritase.id } })
    expect(auditCount).toBe(2)
  })

  it('menolak ritase wajib menyimpan alasan dan mengunci perubahan setelah diproses', async () => {
    const { ritase } = await createFixture()

    await expect(
      prisma.$queryRaw`SELECT tolak_ritase(${ritase.id}, ${''}, ${'pengawas'}, ${'Pengawas Test'}, ${'test'})`,
    ).rejects.toThrow()

    await prisma.$queryRaw`SELECT tolak_ritase(${ritase.id}, ${'Tonase tidak sesuai dokumen'}, ${'pengawas'}, ${'Pengawas Test'}, ${'test'})`

    const rejected = await prisma.ritase.findUniqueOrThrow({ where: { id: ritase.id } })
    expect(rejected.status).toBe('DITOLAK')
    expect(rejected.catatanTolak).toBe('Tonase tidak sesuai dokumen')

    await expect(
      prisma.ritase.update({
        where: { id: ritase.id },
        data: { asal: 'Pit Berubah' },
      }),
    ).rejects.toThrow()
  })

  it('menolak tonase yang tidak konsisten dengan kapasitas x density', async () => {
    const { ritase } = await createFixture()

    await expect(
      prisma.ritase.update({
        where: { id: ritase.id },
        data: { tonase: 17 },
      }),
    ).rejects.toThrow()
  })

  it('ritase DISETUJUI tidak boleh dihapus', async () => {
    const { ritase } = await createFixture()

    await prisma.$queryRaw`SELECT setujui_ritase(${ritase.id}, ${'pengawas'}, ${'Pengawas Test'}, ${'test'})`
    await prisma.$queryRaw`SELECT setujui_ritase(${ritase.id}, ${'checker'}, ${'Checker Test'}, ${'test'})`

    await expect(prisma.ritase.delete({ where: { id: ritase.id } })).rejects.toThrow()
  })
})
