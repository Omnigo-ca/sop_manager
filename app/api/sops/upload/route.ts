import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { parseSopMarkdown } from '@/lib/parseSopMarkdown';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/sops/upload:
 *   post:
 *     summary: Télécharge et importe un SOP à partir d'un fichier Markdown
 *     description: |
 *       Permet de télécharger un fichier Markdown contenant un SOP et de l'importer dans la base de données.
 *       Le fichier est analysé pour extraire les métadonnées et le contenu du SOP.
 *     tags:
 *       - SOPs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Fichier Markdown contenant le SOP à importer
 *     responses:
 *       200:
 *         description: SOP importé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 instructions:
 *                   type: string
 *                 category:
 *                   type: string
 *                 priority:
 *                   type: string
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: string
 *                 steps:
 *                   type: array
 *                   items:
 *                     type: object
 *                 authorId:
 *                   type: string
 *                 author:
 *                   type: string
 *       400:
 *         description: Erreur dans le format du fichier
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Erreur serveur
 */
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