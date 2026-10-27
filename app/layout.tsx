import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "VidyaGyan Portal",
  description: "The official student portal of VidyaGyan.",
};

const themeScript = `try{if(localStorage.getItem("vgb-theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
