import { Card, CardTitle } from "../components/ui/Card";

export default function Page() {
  return (
    <div className="grid gap-4 md:gap-6">
      <Card>
        <CardTitle>Welcome</CardTitle>
        <p className="muted">
          Use <a className="link" href="/submit">/submit</a> to add feedback and{" "}
          <a className="link" href="/inbox">/inbox</a> to view it.
        </p>
      </Card>
    </div>
  );
}
