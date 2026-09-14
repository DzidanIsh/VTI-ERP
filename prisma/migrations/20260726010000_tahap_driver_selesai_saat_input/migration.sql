-- Tahap driver selesai oleh tindakan input ritase itu sendiri (FSD-003 & BPMN),
-- sehingga ritase baru langsung masuk antrian Pengawas (tahapIndex 1).
-- Driver tidak lagi perlu menyetujui entrinya sendiri.

-- AlterTable
ALTER TABLE "Ritase" ALTER COLUMN "tahapIndex" SET DEFAULT 1;
