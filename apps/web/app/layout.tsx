import type { Metadata } from 'next';
import './globals.css';
import { AuthListener } from '@/components/AuthListener';

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
        <AuthListener />
        {children}
      </body>
    </html>
  );
}


