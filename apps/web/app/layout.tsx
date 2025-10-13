import "./globals.css";
import { Toaster } from "sonner";

export const metadata = {
  title: "Vamoot",
  description: "AI feedback platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-900">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
