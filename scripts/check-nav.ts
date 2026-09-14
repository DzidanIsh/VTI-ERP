// Cek logika nav per peran. Jalankan: node scripts/check-nav.ts
// ponytail: assert polos tanpa framework — gagal = throw, cukup untuk logika nav
import assert from "node:assert";
import { MODULES, modulesForRole, PAGE_ROLES, homeFor, getModuleByPath, moduleHome } from "../lib/nav.ts";

// driver: hanya modul Produksi dengan satu item Ritase Entry
const driver = modulesForRole("driver");
assert.equal(driver.length, 1);
assert.deepEqual(
  driver[0].groups.flatMap((g) => g.items.map((i) => i.href)),
  ["/mining/ritase"]
);

// pengawas: Produksi lengkap (validasi + monitoring), tanpa Manajemen
const pengawas = modulesForRole("pengawas");
assert.deepEqual(pengawas.map((m) => m.id), ["produksi"]);
assert.ok(pengawas[0].groups.some((g) => g.items.some((i) => i.href === "/mining/validasi")));

// owner: satu modul Produksi berisi semua grup (modul tim lain menyusul saat formnya masuk)
const owner = modulesForRole("owner");
assert.deepEqual(owner.map((m) => m.id), ["produksi"]);
assert.equal(owner[0].groups.length, 8);

// guard middleware: laporan khusus owner, ritase terbuka untuk driver,
// rencana & status unit untuk validator (bukan driver)
assert.deepEqual(PAGE_ROLES["/mining/laporan"], ["owner"]);
assert.ok(PAGE_ROLES["/mining/ritase"].includes("driver"));
assert.ok(!PAGE_ROLES["/mining/rencana"].includes("driver"));
assert.ok(PAGE_ROLES["/mining/status-unit"].includes("pengawas"));

// homeFor tidak boleh melempar ke halaman yang perannya sendiri dilarang (loop redirect)
for (const role of ["driver", "pengawas", "checker", "owner"] as const) {
  assert.ok(PAGE_ROLES[homeFor(role)].includes(role), `loop redirect utk ${role}`);
}

// resolusi modul dari path
assert.equal(getModuleByPath("/mining").id, "produksi");
assert.equal(getModuleByPath("/mining/ritase").id, "produksi");
assert.equal(getModuleByPath("/mining/halaman-belum-ada").id, "produksi"); // fallback base

// tujuan switcher unik per modul (base sama bukan masalah)
assert.equal(new Set(MODULES.map(moduleHome)).size, MODULES.length);

console.log("check-nav: semua lolos");
