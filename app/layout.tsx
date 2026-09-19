import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "VidyaGyan Council Portal",
  description:
    "The official student leadership and council coordination portal of VidyaGyan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
