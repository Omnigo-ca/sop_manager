import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Récupère la liste des utilisateurs
 *     description: Retourne une liste des utilisateurs avec seulement leurs ID et noms
 *     tags:
 *       - Utilisateurs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "user_2fj38fj"
 *                   name:
 *                     type: string
 *                     example: "John Doe"
 */
export async function GET() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true }
  });
  return NextResponse.json(users);
} 