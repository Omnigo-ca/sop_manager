import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true }
  });
  return NextResponse.json(users);
} 