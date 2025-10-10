import "../lib/posthog.client";
import "./globals.css";
import { ThemeToggle } from "../components/theme/Toggle";

export const metadata = { title: "PulseAI Feedback" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-40 border-b border-cardBorder bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75">
          <div className="container-page flex h-14 items-center justify-between">
            <a href="/" className="font-semibold tracking-tight">PulseAI Feedback</a>
            <div className="flex items-center gap-4">
              <nav className="flex items-center gap-4 text-sm">
                <a className="hover:opacity-80" href="/">Home</a>
                <a className="hover:opacity-80" href="/submit">/submit</a>
                <a className="hover:opacity-80" href="/inbox">/inbox</a>
                <a className="hover:opacity-80" href="/health">/health</a>
              </nav>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="container-page py-6 md:py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
