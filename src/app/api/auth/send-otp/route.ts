import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);
const OTP_SECRET = process.env.OTP_SECRET || 'default_fallback_secret_decisely';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is missing. In development, we will mock the OTP.");
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration to 10 minutes from now
    const expiresAt = Date.now() + 10 * 60 * 1000;

    // Create hash
    const data = `${email}.${otp}.${expiresAt}`;
    const hash = crypto.createHmac('sha256', OTP_SECRET).update(data).digest('hex');
    
    const cookieValue = `${hash}.${expiresAt}`;

    if (process.env.RESEND_API_KEY) {
      // Send email
      await resend.emails.send({
        from: 'Decisely <verify@promptify.fun>',
        to: email,
        subject: 'Your Decisely Verification Code',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #0a0a0a; margin-bottom: 24px;">Verify your email address</h2>
            <p style="color: #404040; font-size: 16px; line-height: 24px;">Please use the following verification code to complete your signup for Decisely:</p>
            <div style="background-color: #f5f5f5; padding: 24px; border-radius: 12px; text-align: center; margin: 32px 0;">
              <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #0a0a0a;">${otp}</span>
            </div>
            <p style="color: #737373; font-size: 14px;">This code will expire in 10 minutes.</p>
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;" />
            <p style="color: #a3a3a3; font-size: 12px;">If you didn't request this code, you can safely ignore this email.</p>
          </div>
        `,
      });
    } else {
      console.log(`\n\n=== MOCK OTP FOR ${email} ===\n${otp}\n============================\n\n`);
    }

    const response = NextResponse.json({ success: true, message: 'OTP sent successfully' });
    
    // Set HTTP-only cookie
    response.cookies.set('otp_verification', cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60, // 10 minutes
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ error: 'Failed to send OTP. Please try again.' }, { status: 500 });
  }
}
