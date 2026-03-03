// ============================
// Root Layout
// ============================
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Profile Project | Gidy.ai Profile Replica',
  description: 'A high-fidelity profile page featuring skill endorsements, interactive work timeline, and persistent dark mode. Built with Next.js, TypeScript, and SQLite.',
  keywords: ['profile', 'portfolio', 'developer', 'skills', 'endorsements'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>{children}</body>
    </html>
  );
}
