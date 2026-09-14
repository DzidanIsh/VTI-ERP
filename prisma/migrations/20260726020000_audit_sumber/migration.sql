-- Menandai lewat mana sebuah aksi dilakukan: web (default), asisten (AI), telegram.
-- "oleh" tetap berisi nama manusia yang bertanggung jawab; kolom ini hanya kanalnya.

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "sumber" TEXT NOT NULL DEFAULT 'web';
