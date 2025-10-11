import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PulseAI - AI-Powered Feedback Platform',
  description: 'Multi-tenant feedback SaaS with AI-powered analysis',
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


