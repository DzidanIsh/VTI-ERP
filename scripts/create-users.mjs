// Buat akun uji Supabase Auth per peran (jalankan sekali: node scripts/create-users.mjs)
// Memakai SUPABASE_SECRET_KEY — hanya untuk server/CLI, jangan diekspos ke client.
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Password seragam untuk pilot — ganti saat go-live.
const PASSWORD = "VTI2026!";
const USERS = [
  { email: "driver@vti.id", nama: "Andi Saputra", role: "driver" },
  { email: "pengawas@vti.id", nama: "Rudi Pengawas", role: "pengawas" },
  { email: "checker@vti.id", nama: "Sari Checker", role: "checker" },
  { email: "owner@vti.id", nama: "Owner VIP", role: "owner" },
  { email: "hr@vti.id", nama: "Hana HR", role: "hr" },
  { email: "lab@vti.id", nama: "Lia Lab", role: "lab" },
];

for (const u of USERS) {
  const { error } = await supabase.auth.admin.createUser({
    email: u.email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { nama: u.nama, role: u.role },
  });
  console.log(u.email, "->", error ? `GAGAL: ${error.message}` : "OK");
}
