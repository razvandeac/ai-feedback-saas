import "../lib/posthog.client";
import "./globals.css";

export const metadata = { title: "PulseAI Feedback" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background:"#fafafa" }}>
        <header style={{padding:"12px 16px",borderBottom:"1px solid #eee",background:"#fff"}}>
          <strong>PulseAI Feedback</strong>
          <nav style={{display:"inline-flex",gap:12,marginLeft:16}}>
            <a href="/" style={{textDecoration:"none"}}>Home</a>
            <a href="/submit" style={{textDecoration:"none"}}>/submit</a>
            <a href="/inbox" style={{textDecoration:"none"}}>/inbox</a>
            <a href="/health" style={{textDecoration:"none"}}>/health</a>
          </nav>
        </header>
        <main style={{padding:16,maxWidth:960,margin:"0 auto"}}>{children}</main>
      </body>
    </html>
  );
}
