-- CreateEnum
CREATE TYPE "JenisKejadian" AS ENUM ('BREAKDOWN', 'STANDBY', 'HUJAN', 'SLIPPERY', 'LAINNYA');

-- CreateTable
CREATE TABLE "RencanaHarian" (
    "id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "targetTon" DOUBLE PRECISION NOT NULL,
    "catatan" TEXT,
    "dibuatOleh" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RencanaHarian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KejadianOperasi" (
    "id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "jenis" "JenisKejadian" NOT NULL,
    "unitId" TEXT,
    "jamMulai" TEXT NOT NULL,
    "jamSelesai" TEXT,
    "keterangan" TEXT,
    "dicatatOleh" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KejadianOperasi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RencanaHarian_tanggal_key" ON "RencanaHarian"("tanggal");

-- AddForeignKey
ALTER TABLE "KejadianOperasi" ADD CONSTRAINT "KejadianOperasi_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
