import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "0a Systems",
  description: "Cross-platform event forecasting analytics dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
