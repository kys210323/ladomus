import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "La Domus Background Video",
  description: "Background video example",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* 유튜브 IFrame API 스크립트 로드 */}
        <script src="https://www.youtube.com/iframe_api"></script>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
