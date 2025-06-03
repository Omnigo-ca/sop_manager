import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  const sops = await prisma.sop.findMany({
    include: { user: true }
  });
  const sopsWithAuthor = sops.map(sop => ({
    ...sop,
    author: sop.user?.name || sop.authorId,
  }));
  return NextResponse.json(sopsWithAuthor);
}

export async function POST(req: Request) {
  const data = await req.json();
  const { author, ...rest } = data;
  if (rest.priority) rest.priority = rest.priority.toLowerCase();
  const sop = await prisma.sop.create({ data: rest, include: { user: true } });
  return NextResponse.json({
    ...sop,
    author: sop.user?.name || sop.authorId,
  });
} 