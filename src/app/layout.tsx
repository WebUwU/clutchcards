import type { Metadata } from "next";
import { Chakra_Petch, Inter, JetBrains_Mono } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthSessionProvider } from "@/components/providers/SessionProvider";
import { GameDataProvider } from "@/components/providers/GameDataProvider";
import { SettingsEffects } from "@/components/providers/SettingsEffects";
import "./globals.css";

const display = Chakra_Petch({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "ClutchCards — Collect. Trade. Clutch.",
  description:
    "Collect digital cards by completing Valorant-based quests, opening packs, and trading on the market. Build your collection and complete your legacy.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <AuthSessionProvider>
          <GameDataProvider>
            <SettingsEffects />
            <ToastProvider>{children}</ToastProvider>
          </GameDataProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
