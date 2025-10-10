import { Card, CardTitle } from "../components/ui/Card";

export default function Page() {
  return (
    <div style={{display:"grid",gap:16}}>
      <Card><CardTitle>Welcome</CardTitle><p>Use <code>/submit</code> to add feedback and <code>/inbox</code> to view it.</p></Card>
    </div>
  );
}
