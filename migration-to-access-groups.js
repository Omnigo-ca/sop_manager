const { PrismaClient } = require('./lib/generated/prisma');

const prisma = new PrismaClient();

async function migrateToAccessGroups() {
  console.log('🚀 Début de la migration vers les groupes d\'accès...');

  try {
    // 1. Créer les groupes d'accès par défaut
    console.log('📂 Création des groupes d\'accès par défaut...');
    
    const internalGroup = await prisma.accessGroup.upsert({
      where: { name: 'Procédures Internes' },
      update: {},
      create: {
        name: 'Procédures Internes',
        description: 'Accès aux procédures internes de l\'organisation',
        type: 'INTERNAL'
      }
    });

    const publicGroup = await prisma.accessGroup.upsert({
      where: { name: 'Procédures Publiques' },
      update: {},
      create: {
        name: 'Procédures Publiques', 
        description: 'Accès aux procédures publiques pour les clients',
        type: 'PUBLIC'
      }
    });

    const adminGroup = await prisma.accessGroup.upsert({
      where: { name: 'Toutes les Procédures' },
      update: {},
      create: {
        name: 'Toutes les Procédures',
        description: 'Accès complet à toutes les procédures (Administrateurs)',
        type: 'ADMIN'
      }
    });

    console.log('✅ Groupes d\'accès créés');

    // 2. Assigner des groupes par défaut selon les catégories de SOP existantes
    console.log('📋 Migration des SOPs vers les groupes d\'accès...');
    
    // Récupérer toutes les SOPs existantes
    const allSops = await prisma.sop.findMany();
    
    for (const sop of allSops) {
      let targetGroupId;
      
      // Logique d'assignation basée sur la catégorie
      if (sop.category && sop.category.toLowerCase().includes('interne')) {
        targetGroupId = internalGroup.id;
      } else if (sop.category && (sop.category.toLowerCase().includes('public') || sop.category.toLowerCase().includes('client'))) {
        targetGroupId = publicGroup.id;
      } else {
        // Par défaut, assigner au groupe interne
        targetGroupId = internalGroup.id;
      }

      await prisma.sop.update({
        where: { id: sop.id },
        data: { accessGroupId: targetGroupId }
      });
    }

    console.log(`✅ ${allSops.length} SOPs migrées vers les groupes d\'accès`);

    // 3. Assigner les utilisateurs aux groupes selon leur rôle
    console.log('👥 Migration des utilisateurs vers les groupes d\'accès...');
    
    const allUsers = await prisma.user.findMany();
    
    for (const user of allUsers) {
      switch (user.role) {
        case 'ADMIN':
          // Les admins ont accès à tout
          await prisma.userAccessGroup.upsert({
            where: {
              userId_accessGroupId: {
                userId: user.id,
                accessGroupId: adminGroup.id
              }
            },
            update: {},
            create: {
              userId: user.id,
              accessGroupId: adminGroup.id
            }
          });
          break;
          
        case 'AUTHOR':
          // Les auteurs ont accès aux procédures internes
          await prisma.userAccessGroup.upsert({
            where: {
              userId_accessGroupId: {
                userId: user.id,
                accessGroupId: internalGroup.id
              }
            },
            update: {},
            create: {
              userId: user.id,
              accessGroupId: internalGroup.id
            }
          });
          break;
          
        case 'USER':
          // Les utilisateurs standard ont accès aux procédures publiques
          await prisma.userAccessGroup.upsert({
            where: {
              userId_accessGroupId: {
                userId: user.id,
                accessGroupId: publicGroup.id
              }
            },
            update: {},
            create: {
              userId: user.id,
              accessGroupId: publicGroup.id
            }
          });
          break;
      }
    }

    console.log(`✅ ${allUsers.length} utilisateurs assignés aux groupes d\'accès`);

    // 4. Optionnel: Nettoyer les anciens accès individuels
    console.log('🧹 Nettoyage des anciens accès individuels...');
    
    // Commenter cette ligne si vous voulez garder les anciens accès pendant la transition
    // await prisma.sopAccess.deleteMany({});
    
    console.log('⚠️  Les anciens accès individuels ont été conservés pour la transition');

    console.log('🎉 Migration terminée avec succès!');
    
    // Afficher un résumé
    const groupSummary = await prisma.accessGroup.findMany({
      include: {
        _count: {
          select: {
            sops: true,
            users: true
          }
        }
      }
    });

    console.log('\n📊 Résumé des groupes d\'accès:');
    groupSummary.forEach(group => {
      console.log(`  • ${group.name}: ${group._count.sops} SOPs, ${group._count.users} utilisateurs`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration
if (require.main === module) {
  migrateToAccessGroups()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

module.exports = { migrateToAccessGroups }; 