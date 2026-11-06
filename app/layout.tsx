import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { AuthModalProvider } from "@/components/AuthModalProvider";
import AuthModal from "@/components/AuthModal"; // added in Part 2; comment out until then

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = DM_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Yozora: Watch anime", template: "%s | Yozora" },
  description: "Discover, track and watch anime. A UI demo with mock data.",
};
export const viewport: Viewport = { themeColor: "#09090f", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <AuthModalProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2"
          >
            Skip to content
          </a>
          <Navbar />
          <main id="main" className="min-h-[70vh] pt-16">{children}</main>
          <Footer />
          <ScrollToTop />
          <AuthModal />
        </AuthModalProvider>
      </body>
    </html>
  );
}