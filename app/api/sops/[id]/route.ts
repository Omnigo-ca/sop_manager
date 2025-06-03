import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/sops/{id}:
 *   get:
 *     summary: Récupère un SOP spécifique
 *     description: Retourne les détails d'un SOP particulier en fonction de son ID
 *     tags:
 *       - SOPs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du SOP à récupérer
 *     responses:
 *       200:
 *         description: SOP récupéré avec succès
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
 *                 priority:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 editedAt:
 *                   type: string
 *                   format: date-time
 *                 author:
 *                   type: string
 *       404:
 *         description: SOP non trouvé
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const sop = await prisma.sop.findUnique({
    where: { id: params.id },
    include: { user: true }
  });
  
  if (!sop) {
    return NextResponse.json({ error: 'SOP non trouvé' }, { status: 404 });
  }
  
  return NextResponse.json({
    ...sop,
    author: sop.user?.name || sop.authorId,
  });
}

/**
 * @swagger
 * /api/sops/{id}:
 *   patch:
 *     summary: Met à jour un SOP existant
 *     description: Modifie les informations d'un SOP en fonction de son ID
 *     tags:
 *       - SOPs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du SOP à mettre à jour
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
 *               priority:
 *                 type: string
 *     responses:
 *       200:
 *         description: SOP mis à jour avec succès
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
 *                 priority:
 *                   type: string
 *       404:
 *         description: SOP non trouvé
 */
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

  try {
    const sop = await prisma.sop.update({
      where: { id: params.id },
      data: {
        ...data,
        editedAt: new Date(),
      },
    });
    return NextResponse.json(sop);
  } catch (error) {
    return NextResponse.json({ error: 'SOP non trouvé' }, { status: 404 });
  }
}

/**
 * @swagger
 * /api/sops/{id}:
 *   delete:
 *     summary: Supprime un SOP
 *     description: Supprime définitivement un SOP en fonction de son ID
 *     tags:
 *       - SOPs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du SOP à supprimer
 *     responses:
 *       200:
 *         description: SOP supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: SOP non trouvé
 */
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.sop.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'SOP non trouvé' }, { status: 404 });
  }
} 