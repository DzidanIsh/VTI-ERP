"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser, type SessionUser } from "@/lib/supabase/client";

interface UserCtx {
  user: SessionUser | null;
  signOut: () => void;
}

const Ctx = React.createContext<UserCtx>({ user: null, signOut: () => {} });

export function UserProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = React.useState<SessionUser | null>(null);

  React.useEffect(() => {
    supabaseBrowser()
      .auth.getUser()
      .then(({ data }) => {
        if (!data.user) return;
        const m = data.user.user_metadata ?? {};
        setUser({
          id: data.user.id,
          nama: String(m.nama ?? data.user.email),
          role: m.role ?? "driver",
          email: data.user.email ?? "",
        });
      });
  }, []);

  const signOut = () => {
    supabaseBrowser()
      .auth.signOut()
      .then(() => {
        router.replace("/login");
        router.refresh();
      });
  };

  return <Ctx.Provider value={{ user, signOut }}>{children}</Ctx.Provider>;
}

export const useUser = () => React.useContext(Ctx);
