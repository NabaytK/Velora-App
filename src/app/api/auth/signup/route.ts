import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' }, 
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } 
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'An account with this email already exists' }, 
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = uuidv4();

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        verificationToken: verificationToken,
        verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        profile: { 
          create: {
            membershipLevel: 'Basic'
          } 
        }
      }
    });

    // Return success response
    return NextResponse.json(
      { 
        message: 'Account created successfully',
        userId: user.id,
        verificationToken: verificationToken
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    
    return NextResponse.json(
      { message: 'Failed to create account. Please try again.' }, 
      { status: 500 }
    );
  }
}
