"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export const SCHOOL_EMAIL_DOMAIN = "@vidyagyan.in";

export function isSchoolEmail(email: string) {
  return email.trim().toLowerCase().endsWith(SCHOOL_EMAIL_DOMAIN);
}

export type PortalProfile = {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  admin_status: "yes" | "no";
};

export function isAdmin(
  profile: { admin_status?: string | null } | null | undefined
) {
  return profile?.admin_status?.toLowerCase() === "yes";
}

export async function getPortalProfile(supabase: SupabaseClient) {
  const { data, error } = await supabase.rpc("get_my_portal_profile");

  if (error) {
    throw error;
  }

  const row = Array.isArray(data) ? data[0] : data;

  if (!row) {
    return null;
  }

  return {
    id: String(row.id ?? ""),
    name: row.name ?? null,
    email: row.email ?? null,
    role: row.role ?? null,
    admin_status: isAdmin(row) ? "yes" : "no",
  } satisfies PortalProfile;
}

export function useAdminGuard() {
  const router = useRouter();
  const supabase = createClient();
  const [ready, setReady] = useState(false);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function sync(userId: string | undefined) {
      if (!userId) {
        router.replace("/?auth=required");
        return;
      }

      try {
        const profile = await getPortalProfile(supabase);

        if (!mounted) return;

        setAdmin(isAdmin(profile));
        setReady(true);
      } catch {
        if (!mounted) return;
        setAdmin(false);
        setReady(true);
      }
    }

    supabase.auth.getUser().then(({ data }) => {
      sync(data.user?.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session?.user) {
        router.replace("/");
        return;
      }

      sync(session.user.id);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  return { ready, admin };
}
