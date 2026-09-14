"use client";

import * as React from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Membuka dialog cetak browser — pilih "Save as PDF" untuk menyimpan berkas. */
export function TombolCetak({ otomatis }: { otomatis?: boolean }) {
  React.useEffect(() => {
    // Dipanggil chatbot dengan ?cetak=1 supaya dialog langsung terbuka.
    if (otomatis) {
      const t = setTimeout(() => window.print(), 700);
      return () => clearTimeout(t);
    }
  }, [otomatis]);

  return (
    <Button onClick={() => window.print()} size="sm">
      <Printer className="h-4 w-4" /> Cetak / Simpan PDF
    </Button>
  );
}
