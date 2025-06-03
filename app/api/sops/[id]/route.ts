import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json();

  // Empêcher la modification de certains champs
  delete data.author;
  delete data.authorId;
  delete data.createdAt;
  delete data.updatedAt;
  delete data.id;
  delete data.user;

  if (data.priority) data.priority = data.priority.toLowerCase();

  const sop = await prisma.sop.update({
    where: { id: params.id },
    data,
  });
  return NextResponse.json(sop);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await prisma.sop.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
} 