import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' }, 
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() },
      include: { profile: true }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' }, 
        { status: 401 }
      );
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json(
        { message: 'Please verify your email before logging in' }, 
        { status: 403 }
      );
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid email or password' }, 
        { status: 401 }
      );
    }

    // Update last login
    await prisma.userProfile.update({
      where: { userId: user.id },
      data: { lastLogin: new Date() }
    });

    // Set authentication cookie
    cookies().set('auth_token', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    });

    // Return user data (excluding sensitive information)
    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        membershipLevel: user.profile?.membershipLevel
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Server error. Please try again.' }, 
      { status: 500 }
    );
  }
}
