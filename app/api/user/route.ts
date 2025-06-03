import { getCurrentUser } from '@/lib/auth.server';
import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Récupère les informations de l'utilisateur connecté
 *     description: Retourne les données de l'utilisateur actuellement authentifié
 *     tags:
 *       - Utilisateurs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informations de l'utilisateur récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "user_2fj38fj"
 *                 email:
 *                   type: string
 *                   example: "user@example.com"
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 role:
 *                   type: string
 *                   example: "USER"
 *       401:
 *         description: Utilisateur non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Non authentifié"
 *       500:
 *         description: Erreur serveur
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' }, 
        { status: 401 }
      );
    }
    
    // Ne pas exposer certaines informations sensibles si nécessaire
    return NextResponse.json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération des données utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' }, 
      { status: 500 }
    );
  }
} 