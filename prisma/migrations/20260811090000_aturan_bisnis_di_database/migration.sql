-- =====================================================================
-- Aturan bisnis pindah ke database (konsep dari branch draga).
--
-- Sebelum ini seluruh aturan hidup di route TypeScript. Siapa pun yang
-- memegang DATABASE_URL (script, Prisma Studio, psql, atau kelak aplikasi
-- mobile) bisa melewatinya. Mulai migrasi ini database sendiri yang
-- menolak: CHECK untuk bentuk data, trigger untuk immutability, dan
-- fungsi PL/pgSQL untuk alur validasi berjenjang.
--
-- Bentuk tabel TIDAK berubah — tetap 1 baris = 1 ritase, tonase melekat
-- di ritase (keputusan Juli 2026). Yang diambil dari draga hanya cara
-- menegakkannya.
-- =====================================================================

-- ---------------------------------------------------------------------
-- CHECK: bentuk data yang tidak boleh terjadi, apa pun jalurnya
-- ---------------------------------------------------------------------
ALTER TABLE "Ritase"
  -- konsistensi status vs tahap: hanya yang lolos 3 tahap boleh DISETUJUI
  ADD CONSTRAINT ritase_status_tahap CHECK (
    (status = 'DISETUJUI' AND "tahapIndex" = 3) OR
    (status = 'MENUNGGU'  AND "tahapIndex" BETWEEN 0 AND 2) OR
    (status = 'DITOLAK'   AND "tahapIndex" BETWEEN 0 AND 3)
  ),
  ADD CONSTRAINT ritase_tolak_wajib_alasan CHECK (
    status <> 'DITOLAK' OR ("catatanTolak" IS NOT NULL AND length(trim("catatanTolak")) > 0)
  ),
  ADD CONSTRAINT ritase_snapshot_positif CHECK (
    "kapasitasM3" > 0 AND density > 0 AND tonase > 0 AND kadar >= 0 AND "hargaPerRitase" >= 0
  ),
  -- BRULE-002: tonase = kapasitas vessel x density (toleransi pembulatan 1 desimal)
  ADD CONSTRAINT ritase_tonase_konsisten CHECK (
    abs(tonase - "kapasitasM3" * density) <= 0.051
  ),
  -- keputusan terkunci: 1 baris = 1 ritase, jadi nilai = harga per ritase persis
  ADD CONSTRAINT ritase_satu_baris_satu_rit CHECK (nilai = "hargaPerRitase");

-- ---------------------------------------------------------------------
-- Immutability: data dasar pembayaran tidak bisa diutak-atik
-- ---------------------------------------------------------------------

-- Ritase yang sudah diproses (DISETUJUI/DITOLAK) terkunci selamanya.
CREATE OR REPLACE FUNCTION cegah_ubah_ritase_final() RETURNS trigger AS $$
BEGIN
  IF OLD.status <> 'MENUNGGU' THEN
    RAISE EXCEPTION 'Ritase sudah % dan terkunci — tidak bisa diubah', lower(OLD.status::text)
      USING ERRCODE = '23000';
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ritase_terkunci BEFORE UPDATE ON "Ritase"
  FOR EACH ROW EXECUTE FUNCTION cegah_ubah_ritase_final();

-- Ritase DISETUJUI adalah dasar bayar vendor — tidak bisa dihapus.
CREATE OR REPLACE FUNCTION cegah_hapus_ritase_disetujui() RETURNS trigger AS $$
BEGIN
  IF OLD.status = 'DISETUJUI' THEN
    RAISE EXCEPTION 'Ritase disetujui adalah dasar pembayaran — tidak bisa dihapus'
      USING ERRCODE = '23000';
  END IF;
  RETURN OLD;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ritase_no_delete BEFORE DELETE ON "Ritase"
  FOR EACH ROW EXECUTE FUNCTION cegah_hapus_ritase_disetujui();

-- Jejak audit hanya bisa bertambah (FR-6).
CREATE OR REPLACE FUNCTION audit_hanya_tambah() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Jejak audit tidak bisa diubah atau dihapus' USING ERRCODE = '23000';
END $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_terkunci BEFORE UPDATE OR DELETE ON "AuditLog"
  FOR EACH ROW EXECUTE FUNCTION audit_hanya_tambah();

-- ---------------------------------------------------------------------
-- Validasi berjenjang sebagai fungsi database (BRULE-006, BR-5)
--
-- Route TS hanya meneruskan identitas dari sesi login; keputusan boleh/
-- tidaknya ada di sini. ERRCODE dipilih agar bisa dipetakan ke HTTP:
--   P0002 -> 404, 42501 -> 403, 23000 -> 409.
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION peran_untuk_tahap(p_tahap integer) RETURNS text AS $$
  SELECT CASE p_tahap WHEN 0 THEN 'driver' WHEN 1 THEN 'pengawas' WHEN 2 THEN 'checker' END;
$$ LANGUAGE sql IMMUTABLE;

CREATE OR REPLACE FUNCTION setujui_ritase(
  p_id text, p_role text, p_oleh text, p_sumber text
) RETURNS void AS $$
DECLARE
  r "Ritase";
  v_label text;
BEGIN
  SELECT * INTO r FROM "Ritase" WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ritase tidak ditemukan' USING ERRCODE = 'P0002';
  END IF;
  IF r.status <> 'MENUNGGU' THEN
    RAISE EXCEPTION 'Ritase sudah diproses (bukan MENUNGGU)' USING ERRCODE = '23000';
  END IF;
  IF p_role IS DISTINCT FROM peran_untuk_tahap(r."tahapIndex") THEN
    RAISE EXCEPTION 'Tahap ini hanya bisa divalidasi oleh peran % (Anda: %)',
      peran_untuk_tahap(r."tahapIndex"), p_role USING ERRCODE = '42501';
  END IF;

  v_label := CASE r."tahapIndex" WHEN 0 THEN 'Driver' WHEN 1 THEN 'Pengawas' ELSE 'Checker' END;

  UPDATE "Ritase" SET
    "tahapIndex" = r."tahapIndex" + 1,
    status = CASE WHEN r."tahapIndex" + 1 >= 3
             THEN 'DISETUJUI'::"RitaseStatus" ELSE 'MENUNGGU'::"RitaseStatus" END
  WHERE id = p_id
  RETURNING * INTO r;

  INSERT INTO "AuditLog" (id, "ritaseId", aksi, peran, oleh, sumber)
  VALUES (gen_random_uuid()::text, p_id, 'setuju', v_label, p_oleh, p_sumber);

  -- Tonase baru sah setelah lolos checker -> saldo stockpile bertambah,
  -- atomik dengan perubahan status (satu transaksi, satu fungsi).
  IF r.status = 'DISETUJUI' THEN
    INSERT INTO "StockMovement" (id, tanggal, "stockpileId", jenis, tonase, sumber, "ritaseId")
    VALUES (gen_random_uuid()::text, r.tanggal, r."stockpileId", 'MASUK',
            r.tonase, 'Hauling ' || r.asal, r.id);
  END IF;
END $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION tolak_ritase(
  p_id text, p_alasan text, p_role text, p_oleh text, p_sumber text
) RETURNS void AS $$
DECLARE
  r "Ritase";
  v_label text;
BEGIN
  SELECT * INTO r FROM "Ritase" WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ritase tidak ditemukan' USING ERRCODE = 'P0002';
  END IF;
  IF r.status <> 'MENUNGGU' THEN
    RAISE EXCEPTION 'Ritase sudah diproses (bukan MENUNGGU)' USING ERRCODE = '23000';
  END IF;
  IF p_role IS DISTINCT FROM peran_untuk_tahap(r."tahapIndex") THEN
    RAISE EXCEPTION 'Tahap ini hanya bisa divalidasi oleh peran % (Anda: %)',
      peran_untuk_tahap(r."tahapIndex"), p_role USING ERRCODE = '42501';
  END IF;
  IF p_alasan IS NULL OR length(trim(p_alasan)) = 0 THEN
    RAISE EXCEPTION 'Alasan penolakan wajib diisi' USING ERRCODE = '23502';
  END IF;

  v_label := CASE r."tahapIndex" WHEN 0 THEN 'Driver' WHEN 1 THEN 'Pengawas' ELSE 'Checker' END;

  UPDATE "Ritase" SET status = 'DITOLAK', "catatanTolak" = p_alasan WHERE id = p_id;

  INSERT INTO "AuditLog" (id, "ritaseId", aksi, peran, oleh, sumber)
  VALUES (gen_random_uuid()::text, p_id, 'tolak', v_label, p_oleh, p_sumber);
END $$ LANGUAGE plpgsql;
