-- Gabungkan Tonase ke dalam Ritase (FSD-002): tonase melekat pada ritase,
-- terisi otomatis saat driver input dan ikut divalidasi berjenjang.
-- Satu baris Ritase = satu bolak-balik, sehingga jumlahTrip tidak lagi dipakai.

-- DropForeignKey
ALTER TABLE "Tonase" DROP CONSTRAINT "Tonase_materialId_fkey";

-- DropForeignKey
ALTER TABLE "Tonase" DROP CONSTRAINT "Tonase_unitId_fkey";

-- AlterTable
ALTER TABLE "Ritase" DROP COLUMN "jumlahTrip",
DROP COLUMN "tujuan",
ADD COLUMN     "density" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "kadar" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "kapasitasM3" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "materialId" TEXT NOT NULL,
ADD COLUMN     "stockpileId" TEXT NOT NULL,
ADD COLUMN     "tonase" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "StockMovement" ADD COLUMN     "ritaseId" TEXT;

-- AlterTable
ALTER TABLE "Unit" ADD COLUMN     "kapasitasM3" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "Tonase";

-- CreateIndex
CREATE UNIQUE INDEX "StockMovement_ritaseId_key" ON "StockMovement"("ritaseId");

-- AddForeignKey
ALTER TABLE "Ritase" ADD CONSTRAINT "Ritase_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ritase" ADD CONSTRAINT "Ritase_stockpileId_fkey" FOREIGN KEY ("stockpileId") REFERENCES "Stockpile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_ritaseId_fkey" FOREIGN KEY ("ritaseId") REFERENCES "Ritase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
