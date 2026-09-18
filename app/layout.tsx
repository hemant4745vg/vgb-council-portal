import type { Metadata } from "next";

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
      <body>{children}</body>
    </html>
  );
}
