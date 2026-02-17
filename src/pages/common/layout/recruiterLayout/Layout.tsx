"use client";

import React, { useState } from "react";
import SideBar from "./SideBar";
import TopBar from "./TopBar"; 
import "./recruiter.css";
import ProtectedRoute from "@/components/AuthGaurd/ProtectedRoute";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <ProtectedRoute>
      <div className="d-flex vh-100">
        <SideBar isOpen={open} toggle={() => setOpen(!open)} />

        <div className="flex-grow-1 d-flex flex-column">
          <TopBar />
          <div className="p-4 flex-grow-1 overflow-auto">
            {children}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
