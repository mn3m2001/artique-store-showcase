"use client";

import React, { useEffect, useRef, useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

export function AdminLayoutClient({
  children,
  pendingReviewCount = 0,
  isDemo = true,
}: {
  children: React.ReactNode;
  pendingReviewCount?: number;
  isDemo?: boolean;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = drawerRef.current;
    const selector = 'a[href], button:not([disabled]), [tabindex="0"]';
    panel?.querySelector<HTMLElement>(selector)?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
      if (event.key !== "Tab") return;
      const controls = panel?.querySelectorAll<HTMLElement>(selector);
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    window.addEventListener("resize", handleResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("resize", handleResize);
      previousFocus?.focus();
    };
  }, [mobileMenuOpen]);

  return (
    <div className="admin-shell min-h-screen bg-[#FDFBF7] flex" dir="rtl">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:flex shrink-0">
        <AdminSidebar pendingReviewCount={pendingReviewCount} isDemo={isDemo} />
      </div>

      {/* Mobile Slide-Over Drawer with Backdrop */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer Panel */}
          <div ref={drawerRef} role="dialog" aria-modal="true" aria-label="قائمة إدارة المتجر" className="fixed inset-y-0 right-0 w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col z-10 overflow-y-auto transition-transform duration-300">
            <AdminSidebar
              pendingReviewCount={pendingReviewCount}
              isDemo={isDemo}
              onClose={() => setMobileMenuOpen(false)}
              isMobile
            />
          </div>
        </div>
      )}

      {/* Main Content Area - Full width on mobile/tablet */}
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-hidden">
        <AdminHeader onToggleMobileNav={() => setMobileMenuOpen((prev) => !prev)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
