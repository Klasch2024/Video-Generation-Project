import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Video Studio",
  description: "Character video generation dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
