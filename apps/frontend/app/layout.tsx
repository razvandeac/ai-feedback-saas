import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PulseAI Feedback",
  description: "AI-powered feedback platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">
                PulseAI Feedback
              </h1>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
