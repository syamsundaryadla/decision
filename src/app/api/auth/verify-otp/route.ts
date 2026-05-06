import { NextResponse } from 'next/server';
import crypto from 'crypto';

const OTP_SECRET = process.env.OTP_SECRET || 'default_fallback_secret_decisely';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    // Get cookie from the request header manually as we are in App Router API
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(new RegExp(`(^| )otp_verification=([^;]+)`));
    const cookieValue = match ? match[2] : null;

    if (!cookieValue) {
      return NextResponse.json({ error: 'OTP session expired or not found. Please request a new code.' }, { status: 400 });
    }

    const [storedHash, expiresAt] = cookieValue.split('.');

    // Check expiration
    if (Date.now() > parseInt(expiresAt, 10)) {
      return NextResponse.json({ error: 'OTP has expired. Please request a new code.' }, { status: 400 });
    }

    // Verify hash
    const data = `${email}.${otp}.${expiresAt}`;
    const calculatedHash = crypto.createHmac('sha256', OTP_SECRET).update(data).digest('hex');

    if (calculatedHash !== storedHash) {
      return NextResponse.json({ error: 'Invalid verification code.' }, { status: 400 });
    }

    // OTP is valid!
    // We clear the cookie so it can't be reused
    const response = NextResponse.json({ success: true, message: 'OTP verified successfully' });
    response.cookies.set('otp_verification', '', { maxAge: 0, path: '/' });

    return response;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
