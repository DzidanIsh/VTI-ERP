-- =====================================================================
-- Fitur dari Notulensi Wawancara ERP PT VIP (2026-08):
--   topik 3  — HM & jadwal service unit
--   topik 7  — alur sampel Laboratorium
--   topik 10 — koordinat lokasi pada presensi
-- Aturan ditegakkan database, mengikuti pola migrasi aturan_bisnis.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Presensi: koordinat opsional
-- ---------------------------------------------------------------------
ALTER TABLE "Presensi"
  ADD COLUMN "latMasuk"  DOUBLE PRECISION,
  ADD COLUMN "lonMasuk"  DOUBLE PRECISION,
  ADD COLUMN "latPulang" DOUBLE PRECISION,
  ADD COLUMN "lonPulang" DOUBLE PRECISION,
  ADD CONSTRAINT presensi_koordinat_valid CHECK (
    ("latMasuk"  IS NULL OR ("latMasuk"  BETWEEN -90 AND 90)) AND
    ("lonMasuk"  IS NULL OR ("lonMasuk"  BETWEEN -180 AND 180)) AND
    ("latPulang" IS NULL OR ("latPulang" BETWEEN -90 AND 90)) AND
    ("lonPulang" IS NULL OR ("lonPulang" BETWEEN -180 AND 180))
  );

-- ---------------------------------------------------------------------
-- Service unit: interval + posisi HM service terakhir
-- ---------------------------------------------------------------------
ALTER TABLE "Unit"
  ADD COLUMN "serviceIntervalJam" INTEGER NOT NULL DEFAULT 250,
  ADD COLUMN "hmService" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "serviceTerakhir" TIMESTAMP(3);

-- ---------------------------------------------------------------------
-- Catatan hour meter harian
-- ---------------------------------------------------------------------
CREATE TABLE "CatatanHM" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "tanggal" DATE NOT NULL,
    "hm" DOUBLE PRECISION NOT NULL,
    "dicatatOleh" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatatanHM_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CatatanHM_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT catatan_hm_non_negatif CHECK ("hm" >= 0)
);

CREATE UNIQUE INDEX "CatatanHM_unitId_tanggal_key" ON "CatatanHM"("unitId", "tanggal");

-- Hour meter fisik hanya bisa naik. Pembacaan yang lebih rendah dari tanggal
-- sebelumnya (atau lebih tinggi dari tanggal sesudahnya, saat koreksi) hampir
-- pasti salah ketik — dan jadwal service dihitung dari angka ini.
CREATE OR REPLACE FUNCTION cek_hm_monoton() RETURNS trigger AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "CatatanHM" c
     WHERE c."unitId" = NEW."unitId" AND c.id <> NEW.id
       AND ((c.tanggal < NEW.tanggal AND c.hm > NEW.hm)
         OR (c.tanggal > NEW.tanggal AND c.hm < NEW.hm))
  ) THEN
    RAISE EXCEPTION 'HM tidak boleh turun: bertentangan dengan catatan tanggal lain untuk unit %', NEW."unitId"
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_hm_monoton BEFORE INSERT OR UPDATE ON "CatatanHM"
  FOR EACH ROW EXECUTE FUNCTION cek_hm_monoton();

-- ---------------------------------------------------------------------
-- Laboratorium
-- ---------------------------------------------------------------------
CREATE TYPE "SampelStatus" AS ENUM ('DITERIMA', 'PREPARASI', 'ANALISIS', 'SELESAI');

CREATE TABLE "SampelLab" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "tanggal" DATE NOT NULL,
    "asal" TEXT NOT NULL,
    "stockpileId" TEXT,
    "status" "SampelStatus" NOT NULL DEFAULT 'DITERIMA',
    "kadarNi" DOUBLE PRECISION,
    "mc" DOUBLE PRECISION,
    "keterangan" TEXT,
    "diterimaOleh" TEXT NOT NULL,
    "dianalisisOleh" TEXT,
    "selesaiPada" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SampelLab_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "SampelLab_stockpileId_fkey" FOREIGN KEY ("stockpileId") REFERENCES "Stockpile"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    -- hasil analisis dalam rentang fisik yang masuk akal
    CONSTRAINT sampel_kadar_wajar CHECK ("kadarNi" IS NULL OR ("kadarNi" >= 0 AND "kadarNi" <= 10)),
    CONSTRAINT sampel_mc_wajar    CHECK ("mc" IS NULL OR ("mc" >= 0 AND "mc" <= 100)),
    -- sampel tidak boleh dinyatakan selesai tanpa hasil
    CONSTRAINT sampel_selesai_wajib_kadar CHECK ("status" <> 'SELESAI' OR "kadarNi" IS NOT NULL)
);

CREATE UNIQUE INDEX "SampelLab_kode_key" ON "SampelLab"("kode");

-- Hasil sampel SELESAI dipakai Produksi & menentukan posisi stockpile
-- terhadap COG — sekali selesai, terkunci. Pola yang sama dengan ritase.
CREATE OR REPLACE FUNCTION cegah_ubah_sampel_selesai() RETURNS trigger AS $$
BEGIN
  IF OLD.status = 'SELESAI' THEN
    RAISE EXCEPTION 'Sampel sudah SELESAI dan hasilnya terkunci — tidak bisa diubah'
      USING ERRCODE = '23000';
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sampel_terkunci BEFORE UPDATE ON "SampelLab"
  FOR EACH ROW EXECUTE FUNCTION cegah_ubah_sampel_selesai();
