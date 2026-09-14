-- CreateEnum
CREATE TYPE "RitaseStatus" AS ENUM ('MENUNGGU', 'DISETUJUI', 'DITOLAK');

-- CreateEnum
CREATE TYPE "MovementJenis" AS ENUM ('MASUK', 'KELUAR');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('DIMUAT', 'SURVEI', 'TERJUAL');

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "peran" TEXT NOT NULL,
    "hargaPerRitase" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "bucketM3" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "targetTonBulan" INTEGER NOT NULL DEFAULT 0,
    "vendorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "density" DOUBLE PRECISION NOT NULL,
    "kadarDefault" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stockpile" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "kadar" DOUBLE PRECISION NOT NULL,
    "diAtasCOG" BOOLEAN NOT NULL,

    CONSTRAINT "Stockpile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tongkang" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kapasitas" INTEGER NOT NULL,

    CONSTRAINT "Tongkang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ritase" (
    "id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "unitId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "asal" TEXT NOT NULL,
    "tujuan" TEXT NOT NULL,
    "jumlahTrip" INTEGER NOT NULL,
    "hargaPerRitase" INTEGER NOT NULL,
    "nilai" INTEGER NOT NULL,
    "tahapIndex" INTEGER NOT NULL DEFAULT 0,
    "status" "RitaseStatus" NOT NULL DEFAULT 'MENUNGGU',
    "catatanTolak" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ritase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tonase" (
    "id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "unitId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "pit" TEXT NOT NULL,
    "jumlahBucket" INTEGER NOT NULL,
    "bucketM3" DOUBLE PRECISION NOT NULL,
    "density" DOUBLE PRECISION NOT NULL,
    "tonase" DOUBLE PRECISION NOT NULL,
    "kadar" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tonase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "stockpileId" TEXT NOT NULL,
    "jenis" "MovementJenis" NOT NULL,
    "tonase" DOUBLE PRECISION NOT NULL,
    "sumber" TEXT NOT NULL,
    "shipmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "tongkangId" TEXT NOT NULL,
    "stockpileId" TEXT NOT NULL,
    "kadar" DOUBLE PRECISION NOT NULL,
    "tonaseEstimasi" DOUBLE PRECISION NOT NULL,
    "tonaseSurvei" DOUBLE PRECISION,
    "tonaseFinal" DOUBLE PRECISION,
    "hargaJual" INTEGER,
    "pendapatan" BIGINT,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'DIMUAT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "ritaseId" TEXT NOT NULL,
    "aksi" TEXT NOT NULL,
    "peran" TEXT NOT NULL,
    "oleh" TEXT NOT NULL,
    "waktu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ritase" ADD CONSTRAINT "Ritase_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ritase" ADD CONSTRAINT "Ritase_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ritase" ADD CONSTRAINT "Ritase_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tonase" ADD CONSTRAINT "Tonase_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tonase" ADD CONSTRAINT "Tonase_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_stockpileId_fkey" FOREIGN KEY ("stockpileId") REFERENCES "Stockpile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_tongkangId_fkey" FOREIGN KEY ("tongkangId") REFERENCES "Tongkang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_stockpileId_fkey" FOREIGN KEY ("stockpileId") REFERENCES "Stockpile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_ritaseId_fkey" FOREIGN KEY ("ritaseId") REFERENCES "Ritase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
