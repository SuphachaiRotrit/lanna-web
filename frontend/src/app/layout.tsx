import type { Metadata } from "next";
import { Inter, Prompt } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const prompt = Prompt({ 
  subsets: ["thai", "latin"], 
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-prompt" 
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
      <body className={`${prompt.variable} ${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
