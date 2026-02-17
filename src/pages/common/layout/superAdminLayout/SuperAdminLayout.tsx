"use client";

import React, { useEffect, useState } from "react";
import SideBar from "@/ui/common/layout/superAdminLayout/SideBar"
import TopBar from "@/ui/common/layout/superAdminLayout/TopBar"
import { useSession } from "@/hooks/useSession";
import { useRouter, usePathname } from "next/navigation";
import "./super-admin.css";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!session) return;

    // Not logged in
    if (!session.isLoggedIn) {
      router.replace("/");
      return;
    }

    const role = session.user?.roletbl_roleName;

    const ROLE_HOME: Record<string, string> = {
      SUPER_ADMIN: "/super-admin",
      OPERATIONS_ADMIN: "/super-admin",
      FINANCE_ADMIN: "/super-admin",
      SUPPORT_ADMIN: "/super-admin",
      RECRUITER: "/recruiter",
    };

    const home = ROLE_HOME[role];

    //  IMPORTANT: avoid double navigation
    if (home && pathname.startsWith(home)) return;

    if (home) {
      router.replace(home);
    }
  }, [session?.isLoggedIn]); // ❌ pathname removed

  if (!session) return null;

  return (
    <div className="d-flex vh-100">
      <SideBar isOpen={open} toggle={() => setOpen(!open)} />

      <div className="flex-grow-1 d-flex flex-column">
        <TopBar />
        <div className="p-4 flex-grow-1 overflow-auto position-relative">{children}</div>
      </div>
    </div>
  );
}
