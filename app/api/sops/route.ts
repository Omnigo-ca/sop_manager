import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import markdownIt from 'markdown-it';
import { NextRequest } from 'next/server';
import { parseSopMarkdown } from '@/lib/parseSopMarkdown';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/sops:
 *   get:
 *     summary: Récupère la liste de tous les SOPs
 *     tags:
 *       - SOPs
 *     responses:
 *       200:
 *         description: Liste des SOPs récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   content:
 *                     type: string
 *                   authorId:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                   author:
 *                     type: string
 */
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

/**
 * @swagger
 * /api/sops:
 *   post:
 *     summary: Crée un nouveau SOP
 *     tags:
 *       - SOPs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               authorId:
 *                 type: string
 *               priority:
 *                 type: string
 *     responses:
 *       200:
 *         description: SOP créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 content:
 *                   type: string
 *                 authorId:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 author:
 *                   type: string
 */
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