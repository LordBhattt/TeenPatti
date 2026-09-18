import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Teen Patti | 3 Patti Online",
  description: "Play Teen Patti (3 Patti) with friends online. Create a room, share the code, and play!",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen min-h-[100dvh]">
        <div className="felt-texture min-h-screen min-h-[100dvh] flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
