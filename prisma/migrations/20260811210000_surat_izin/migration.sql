-- =====================================================================
-- Surat izin/sakit/cuti: diajukan dari halaman Presensi, diproses HR
-- lewat menu "Permohonan Cuti". Aturan ditegakkan database.
-- =====================================================================

CREATE TYPE "JenisIzin"  AS ENUM ('IZIN', 'SAKIT', 'CUTI');
CREATE TYPE "StatusIzin" AS ENUM ('MENUNGGU', 'DISETUJUI', 'DITOLAK');

CREATE TABLE "SuratIzin" (
    "id" TEXT NOT NULL,
    "penggunaId" TEXT NOT NULL,
    "penggunaNama" TEXT NOT NULL,
    "penggunaRole" TEXT NOT NULL,
    "jenis" "JenisIzin" NOT NULL,
    "dari" DATE NOT NULL,
    "sampai" DATE NOT NULL,
    "alasan" TEXT NOT NULL,
    "lampiranMime" TEXT,
    "lampiranData" BYTEA,
    "status" "StatusIzin" NOT NULL DEFAULT 'MENUNGGU',
    "catatanHr" TEXT,
    "diprosesOleh" TEXT,
    "diprosesPada" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuratIzin_pkey" PRIMARY KEY ("id"),
    CONSTRAINT izin_rentang_tanggal CHECK ("sampai" >= "dari"),
    CONSTRAINT izin_alasan_wajib CHECK (length(trim("alasan")) > 0),
    CONSTRAINT izin_lampiran_mime CHECK ("lampiranMime" IS NULL OR "lampiranMime" IN ('image/jpeg', 'image/png', 'image/webp')),
    -- 2MB — foto surat sudah di-resize klien
    CONSTRAINT izin_lampiran_maks CHECK ("lampiranData" IS NULL OR octet_length("lampiranData") <= 2097152),
    CONSTRAINT izin_lampiran_berpasangan CHECK (("lampiranMime" IS NULL) = ("lampiranData" IS NULL)),
    -- keputusan tanpa penanggung jawab tidak boleh ada
    CONSTRAINT izin_proses_konsisten CHECK (
      "status" = 'MENUNGGU' OR ("diprosesOleh" IS NOT NULL AND "diprosesPada" IS NOT NULL)
    )
);

CREATE INDEX "SuratIzin_penggunaId_idx" ON "SuratIzin"("penggunaId");
CREATE INDEX "SuratIzin_status_idx" ON "SuratIzin"("status");

-- Keputusan HR bukan draft — sekali diproses, terkunci. Pola yang sama
-- dengan ritase dan sampel lab.
CREATE OR REPLACE FUNCTION cegah_ubah_izin_diproses() RETURNS trigger AS $$
BEGIN
  IF OLD.status <> 'MENUNGGU' THEN
    RAISE EXCEPTION 'Surat izin sudah diproses (%) dan terkunci', OLD.status
      USING ERRCODE = '23000';
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_izin_terkunci BEFORE UPDATE ON "SuratIzin"
  FOR EACH ROW EXECUTE FUNCTION cegah_ubah_izin_diproses();
