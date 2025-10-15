import OtpLogin from '@/components/auth/OtpLogin'
export const dynamic = 'force-dynamic'
export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <OtpLogin />
    </main>
  )
}
