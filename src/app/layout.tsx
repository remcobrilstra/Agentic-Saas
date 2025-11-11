import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Modular microSaaS Template",
  description: "A reusable foundation for building microSaaS applications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
