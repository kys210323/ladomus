// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Site",
  description: "Root layout",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Roboto 400, 500, 700 불러오기 */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Roboto:wghtwght@100;300;400;500;700&display=swap"
        />
      </head>
      <body style={{ fontFamily: "Roboto, sans-serif", fontWeight: 300 }}>
        {children}
      </body>
    </html>
  );
}
