import { NextResponse } from 'next/server'
import { sendInviteEmail } from '@/lib/email'

export async function POST() {
  try {
    const testEmail = {
      to: 'razvan.deac@gmail.com',
      orgName: 'Demo Org',
      role: 'member' as const,
      acceptUrl: 'https://vamoot.vercel.app/accept-invite?token=test123',
      invitedBy: { name: 'Test User', email: 'test@example.com' }
    }

    console.log('Testing email send with:', testEmail)
    
    const result = await sendInviteEmail(testEmail)
    
    return NextResponse.json({
      success: true,
      result: result,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        RESEND_API_KEY: process.env.RESEND_API_KEY ? 'SET' : 'MISSING',
        EMAIL_FROM: process.env.EMAIL_FROM,
        EMAIL_DEV_TO: process.env.EMAIL_DEV_TO
      }
    })
  } catch (error) {
    console.error('Email test failed:', error)
    return NextResponse.json({ 
      error: 'Email test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        RESEND_API_KEY: process.env.RESEND_API_KEY ? 'SET' : 'MISSING',
        EMAIL_FROM: process.env.EMAIL_FROM,
        EMAIL_DEV_TO: process.env.EMAIL_DEV_TO
      }
    }, { status: 500 })
  }
}
