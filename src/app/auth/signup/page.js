import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request) {
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

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        emailVerified: true, // Simplified for now
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
        userId: user.id 
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    
    // More specific error handling
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'An account with this email already exists' }, 
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: 'Failed to create account. Please try again.' }, 
      { status: 500 }
    );
  }
}