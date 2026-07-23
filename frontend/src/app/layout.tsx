import type { Metadata } from "next";
import { Inter, Sarabun } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sarabun"
});

export const metadata: Metadata = {
  title: "ระบบรับสมัครนักศึกษาออนไลน์ | มมร. วิทยาเขตล้านนา",
  description: "ระบบรับสมัครนักศึกษาออนไลน์ มหาวิทยาลัยมหามกุฏราชวิทยาลัย วิทยาเขตล้านนา",
};

import Providers from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${sarabun.variable} ${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
        <Toaster
          position="top-center"
          richColors
          closeButton
          style={{ '--width': '420px' } as React.CSSProperties}
          toastOptions={{
            classNames: {
              toast: '!p-5 !gap-3',
              title: '!text-[15px]',
              description: '!text-[13px]',
              actionButton: '!bg-brand !text-white !h-8 !px-3.5 !text-[13px]',
            },
          }}
        />
      </body>
    </html>
  );
}
