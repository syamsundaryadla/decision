import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

// [VULN-004 FIX] Fail hard if OTP_SECRET is missing — no insecure fallback
const OTP_SECRET = process.env.OTP_SECRET;

export async function POST(req: Request) {
  try {
    // [VULN-003 FIX] Rate limit: max 5 verify attempts per minute per IP
    // This prevents brute-forcing the 6-digit OTP (1M combinations)
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`otp-verify:${ip}`, {
      maxRequests: 5,
      windowSeconds: 60,
    });

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many attempts. Please wait before trying again.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)) } }
      );
    }

    if (!OTP_SECRET) {
      return NextResponse.json(
        { error: 'Server configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    const { email, otp } = await req.json();

    if (!email || !otp || typeof email !== 'string' || typeof otp !== 'string') {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    // Validate OTP format (must be exactly 6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: 'Invalid verification code format.' }, { status: 400 });
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

    // Verify hash using timing-safe comparison
    const data = `${email}.${otp}.${expiresAt}`;
    const calculatedHash = crypto.createHmac('sha256', OTP_SECRET).update(data).digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    const hashBuffer = Buffer.from(calculatedHash, 'hex');
    const storedBuffer = Buffer.from(storedHash, 'hex');

    if (hashBuffer.length !== storedBuffer.length || !crypto.timingSafeEqual(hashBuffer, storedBuffer)) {
      return NextResponse.json({ error: 'Invalid verification code.' }, { status: 400 });
    }

    // OTP is valid! Clear the cookie so it can't be reused
    const response = NextResponse.json({ success: true, message: 'OTP verified successfully' });
    response.cookies.set('otp_verification', '', { maxAge: 0, path: '/' });

    return response;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
