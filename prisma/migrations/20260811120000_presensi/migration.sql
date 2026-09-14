-- =====================================================================
-- Presensi (modul HR — dari draga).
-- Aturan ditegakkan database, mengikuti pola migrasi aturan_bisnis:
--   - satu baris per pengguna per hari (UNIQUE)
--   - jam pulang tidak boleh mendahului jam masuk (CHECK)
--   - presensi yang sudah ditutup tidak bisa dibuka lagi (trigger) —
--     durasi kerja memengaruhi penggajian, membukanya mengubah angka
--     yang mungkin sudah masuk rekap tanpa jejak.
-- =====================================================================

CREATE TABLE "Presensi" (
    "id" TEXT NOT NULL,
    "penggunaId" TEXT NOT NULL,
    "penggunaNama" TEXT NOT NULL,
    "penggunaRole" TEXT NOT NULL,
    "tanggal" DATE NOT NULL,
    "jamMasuk" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "jamPulang" TIMESTAMPTZ(6),
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Presensi_pkey" PRIMARY KEY ("id"),
    CONSTRAINT presensi_urutan_jam CHECK ("jamPulang" IS NULL OR "jamPulang" >= "jamMasuk")
);

CREATE UNIQUE INDEX "Presensi_penggunaId_tanggal_key" ON "Presensi"("penggunaId", "tanggal");
CREATE INDEX "Presensi_tanggal_idx" ON "Presensi"("tanggal");

CREATE OR REPLACE FUNCTION cegah_buka_presensi_tertutup() RETURNS trigger AS $$
BEGIN
  IF OLD."jamPulang" IS NOT NULL AND NEW."jamPulang" IS NULL THEN
    RAISE EXCEPTION 'Presensi sudah ditutup; jam pulang tidak dapat dikosongkan'
      USING ERRCODE = '23000';
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_presensi_tidak_dibuka_lagi
  BEFORE UPDATE ON "Presensi"
  FOR EACH ROW EXECUTE FUNCTION cegah_buka_presensi_tertutup();
