import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { parseSopMarkdown } from '@/lib/parseSopMarkdown';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'Aucun fichier fourni.' }, { status: 400 });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const content = buffer.toString('utf-8');
  let parsed;
  try {
    parsed = parseSopMarkdown(content);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
  let authorId = parsed.authorId || parsed.author;
  const user = await prisma.user.findFirst({ where: { name: parsed.author } });
  if (user) authorId = user.id;
  // Générer un id unique
  const id = 'sop-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex');
  const now = new Date().toISOString();
  const sopData = {
    id,
    title: parsed.title,
    description: parsed.description || '',
    instructions: parsed.instructions,
    category: parsed.category || 'Général',
    priority: parsed.priority || 'medium',
    tags: parsed.tags,
    steps: parsed.steps || [],
    authorId,
    createdAt: now,
    updatedAt: now,
  };
  try {
    const sop = await prisma.sop.create({ data: sopData });
    return NextResponse.json({ ...sop, author: parsed.author });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
} 