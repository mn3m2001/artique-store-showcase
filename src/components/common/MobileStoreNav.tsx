"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingBag, Store } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";

export function MobileStoreNav() {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const { itemCount, isHydrated } = useCart();
  const ar = locale === "ar";
  const items = [
    { href: "/", label: ar ? "الرئيسية" : "Home", icon: Home, active: pathname === "/" },
    { href: "/#categories", label: ar ? "التصنيفات" : "Collections", icon: LayoutGrid, active: false },
    { href: "/products", label: ar ? "المتجر" : "Shop", icon: Store, active: pathname.startsWith("/products") },
    { href: "/cart", label: ar ? "السلة" : "Cart", icon: ShoppingBag, active: pathname === "/cart" },
  ];
  return <nav className="mobile-store-nav" aria-label={ar ? "التنقل السريع في المتجر" : "Quick store navigation"}>
    {items.map(({ href, label, icon: Icon, active }) => <Link href={href} key={href} aria-current={active ? "page" : undefined}>
      <span className="mobile-store-nav-icon"><Icon size={21} aria-hidden="true" />{href === "/cart" && isHydrated && itemCount > 0 && <span className="mobile-store-cart-count">{itemCount}</span>}</span>
      <span>{label}</span>
    </Link>)}
  </nav>;
}
