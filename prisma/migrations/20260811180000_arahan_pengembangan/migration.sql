-- =====================================================================
-- Arahan pengembangan 2026-08-11:
--   - Rencana produksi bulanan & tahunan (pelengkap harian)
--   - Catatan BBM harian per unit (bahan pembanding Dashboard Master)
--   - Foto profil pengguna
--   - Siklus lahan: survey -> pemetaan -> penambangan -> reklamasi
-- =====================================================================

CREATE TYPE "PeriodeRencana" AS ENUM ('BULANAN', 'TAHUNAN');

CREATE TABLE "RencanaPeriode" (
    "id" TEXT NOT NULL,
    "tipe" "PeriodeRencana" NOT NULL,
    "periode" TEXT NOT NULL,
    "targetTon" DOUBLE PRECISION NOT NULL,
    "catatan" TEXT,
    "dibuatOleh" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RencanaPeriode_pkey" PRIMARY KEY ("id"),
    CONSTRAINT rencana_periode_target_positif CHECK ("targetTon" > 0),
    -- format periode mengikuti tipenya: BULANAN "2026-08", TAHUNAN "2026"
    CONSTRAINT rencana_periode_format CHECK (
      ("tipe" = 'BULANAN' AND "periode" ~ '^\d{4}-(0[1-9]|1[0-2])$') OR
      ("tipe" = 'TAHUNAN' AND "periode" ~ '^\d{4}$')
    )
);

CREATE UNIQUE INDEX "RencanaPeriode_tipe_periode_key" ON "RencanaPeriode"("tipe", "periode");

CREATE TABLE "CatatanBBM" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "tanggal" DATE NOT NULL,
    "liter" DOUBLE PRECISION NOT NULL,
    "dicatatOleh" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatatanBBM_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CatatanBBM_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT bbm_liter_positif CHECK ("liter" > 0)
);

CREATE UNIQUE INDEX "CatatanBBM_unitId_tanggal_key" ON "CatatanBBM"("unitId", "tanggal");

CREATE TABLE "ProfilFoto" (
    "penggunaId" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "diperbarui" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfilFoto_pkey" PRIMARY KEY ("penggunaId"),
    CONSTRAINT foto_mime_diizinkan CHECK ("mime" IN ('image/jpeg', 'image/png', 'image/webp')),
    -- 512KB — foto sudah di-resize klien; yang lebih besar hampir pasti bukan avatar
    CONSTRAINT foto_maks_512kb CHECK (octet_length("data") <= 524288)
);

CREATE TYPE "TahapLahan" AS ENUM ('SURVEY', 'PEMETAAN', 'PENAMBANGAN', 'REKLAMASI', 'SELESAI');

CREATE TABLE "Lahan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lon" DOUBLE PRECISION,
    "luasHa" DOUBLE PRECISION,
    "status" "TahapLahan" NOT NULL DEFAULT 'SURVEY',
    "keterangan" TEXT,
    "dibuatOleh" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lahan_pkey" PRIMARY KEY ("id"),
    CONSTRAINT lahan_luas_positif CHECK ("luasHa" IS NULL OR "luasHa" > 0),
    CONSTRAINT lahan_koordinat_valid CHECK (
      ("lat" IS NULL OR ("lat" BETWEEN -90 AND 90)) AND
      ("lon" IS NULL OR ("lon" BETWEEN -180 AND 180))
    )
);

CREATE TABLE "TahapanLahan" (
    "id" TEXT NOT NULL,
    "lahanId" TEXT NOT NULL,
    "tahap" "TahapLahan" NOT NULL,
    "catatan" TEXT,
    "dokumenUrl" TEXT,
    "oleh" TEXT NOT NULL,
    "waktu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TahapanLahan_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TahapanLahan_lahanId_fkey" FOREIGN KEY ("lahanId") REFERENCES "Lahan"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "TahapanLahan_lahanId_idx" ON "TahapanLahan"("lahanId");
