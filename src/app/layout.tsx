import type { Metadata } from "next";
import { cookies } from "next/headers";
import { cairo, playfair, jakarta } from "@/lib/fonts";
import { LanguageProvider } from "@/context/LanguageContext";
import { CartProvider } from "@/context/CartContext";
import { DEFAULT_LOCALE, LOCALE_COOKIE } from "@/lib/i18n";
import { Locale } from "@/types";
import "./globals.css";
import { StoreEffects } from "@/components/common/StoreEffects";

export const metadata: Metadata = {
  title: "Artique | آرتيك — مشغولات كروشيه وهاند ميد دمياط",
  description: "براند مصري للمشغولات اليدوية وفنون الكروشيه من دمياط. سلال تنظيم، دمى أميجورومي، تعليقات حقائب، ورود وديكورات مصنوعة بكل حب.",
  keywords: ["كروشيه دمياط", "مشغولات يدوية", "Artique", "هاند ميد مصر", "سلال كروشيه", "أميجورومي"],
  authors: [{ name: "Artique Crafts" }],
  icons: {
    icon: "/demo-media/logo-67c9bd5fb43debcf.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE)?.value as Locale | undefined;
  const initialLocale: Locale = localeCookie === "en" ? "en" : DEFAULT_LOCALE;
  const dir = initialLocale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={initialLocale}
      dir={dir}
      className={`${cairo.variable} ${playfair.variable} ${jakarta.variable} h-full`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <LanguageProvider initialLocale={initialLocale}>
          <CartProvider>
            <StoreEffects />
            {children}
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
