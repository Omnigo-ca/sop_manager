const { PrismaClient } = require('../lib/generated/prisma');
const prisma = new PrismaClient();
const defaultSops = require('../data/defaultSops.json');

async function main() {
  console.log('🌱 Démarrage du seed de la base de données...');

  // Supprimer tous les utilisateurs et relations existants
  console.log('🧹 Suppression des données existantes...');
  await prisma.sopAccessGroup.deleteMany({});
  await prisma.userAccessGroup.deleteMany({});
  await prisma.sop.deleteMany({});
  await prisma.user.deleteMany({});

  // Création des groupes d'accès
  console.log('📂 Création des groupes d\'accès...');
  const internalGroup = await prisma.accessGroup.upsert({
    where: { name: 'Procédures Internes' },
    update: {},
    create: {
      name: 'Procédures Internes',
      description: 'Accès aux procédures internes de l\'organisation',
      type: 'INTERNAL',
      updatedAt: new Date()
    }
  });

  const publicGroup = await prisma.accessGroup.upsert({
    where: { name: 'Procédures Publiques' },
    update: {},
    create: {
      name: 'Procédures Publiques',
      description: 'Accès aux procédures publiques pour les clients',
      type: 'PUBLIC',
      updatedAt: new Date()
    }
  });

  const administrativeGroup = await prisma.accessGroup.upsert({
    where: { name: 'Procédures Administratives' },
    update: {},
    create: {
      name: 'Procédures Administratives',
      description: 'Accès aux procédures administratives pour la gestion',
      type: 'ADMINISTRATIVE',
      updatedAt: new Date()
    }
  });

  console.log('✅ Groupes d\'accès créés');
  
  // Création des nouveaux utilisateurs fournis
  console.log('👤 Création des nouveaux utilisateurs...');
  const admin = await prisma.user.create({
    data: {
      id: 'user_2y5iuxYm0WlAj2kyijrnZmsLeeX',
      email: 'admin@admin.com',
      name: 'admin',
      role: 'ADMIN',
      createdAt: new Date('2025-06-05 17:29:02.918'),
      updatedAt: new Date('2025-06-05 17:35:33.834'),
    },
  });

  const jojo = await prisma.user.create({
    data: {
      id: 'user_2y5jAnFC3IGCPyLXNQPB5EYkWih',
      email: '0ums9bov3p@ibolinva.com',
      name: 'jojo',
      role: 'USER',
      createdAt: new Date('2025-06-05 17:38:50.122'),
      updatedAt: new Date('2025-06-05 17:38:50.122'),
    },
  });

  const user = await prisma.user.create({
    data: {
      id: 'user_2y5jZYxakbix2FnGE2d1GWbbo2t',
      email: 'user@user.com',
      name: 'user',
      role: 'USER',
      createdAt: new Date('2025-06-05 17:31:32.680'),
      updatedAt: new Date('2025-06-05 17:33:38.249'),
    },
  });

  // Assignation des utilisateurs aux groupes d'accès
  console.log('🔄 Attribution des utilisateurs aux groupes d\'accès...');
  // Admin a accès aux procédures administratives
  await prisma.userAccessGroup.create({
    data: {
      userId: admin.id,
      accessGroupId: administrativeGroup.id
    }
  });

  // Les utilisateurs normaux ont accès aux procédures publiques
  await prisma.userAccessGroup.create({
    data: {
      userId: jojo.id,
      accessGroupId: publicGroup.id
    }
  });

  await prisma.userAccessGroup.create({
    data: {
      userId: user.id,
      accessGroupId: publicGroup.id
    }
  });

  // Map des noms d'auteurs vers les IDs utilisateurs
  const authorMap = {
    'Admin': admin.id,
    'admin': admin.id,
    'jojo': jojo.id,
    'user': user.id,
    'Sophie Martin': admin.id,
    'Thomas Dubois': admin.id,
    'Marie Leroy': admin.id,
    'Julien Rousseau': admin.id,
    'Claire Moreau': admin.id,
    'Antoine Bernard': admin.id,
    'Sarah Petit': admin.id,
    'Lucas Girard': admin.id,
    'Emma Lefevre': admin.id,
    'Vincent Moreau': admin.id,
  };

  // Définir quelles procédures sont administratives (basé sur titre/catégorie)
  const isAdministrative = (sop) => {
    const title = sop.title.toLowerCase();
    const category = sop.category.toLowerCase();
    return title.includes('gestion') || 
           title.includes('administration') || 
           title.includes('audit') ||
           title.includes('contrôle') ||
           title.includes('formation') ||
           category.includes('admin') ||
           category.includes('rh') ||
           category.includes('formation');
  };

  // Définir quelles procédures peuvent être dans plusieurs groupes
  const isMultiGroup = (sop) => {
    const title = sop.title.toLowerCase();
    return title.includes('sécurité') || 
           title.includes('qualité') || 
           title.includes('communication') ||
           title.includes('urgence');
  };

  // Insertion de toutes les SOP par défaut
  console.log('📝 Création des SOPs par défaut...');
  for (const sop of defaultSops) {
    // Créer la SOP
    const createdSop = await prisma.sop.create({
      data: {
        id: sop.id,
        title: sop.title,
        description: sop.description,
        instructions: sop.instructions,
        category: sop.category,
        priority: sop.priority.toLowerCase(),
        tags: sop.tags,
        steps: sop.steps,
        authorId: authorMap[sop.author] || admin.id,
        createdAt: new Date(sop.createdAt),
        updatedAt: new Date(sop.updatedAt),
      },
    });

    // Déterminer les groupes d'accès
    let groupsToAssign = [];

    // Assignation principale basée sur la catégorie
    if (sop.category && sop.category.toLowerCase().includes('public')) {
      groupsToAssign.push(publicGroup.id);
    } else if (sop.category && sop.category.toLowerCase().includes('client')) {
      groupsToAssign.push(publicGroup.id);
    } else {
      groupsToAssign.push(internalGroup.id);
    }

    // Ajouter au groupe administratif si c'est une procédure administrative
    if (isAdministrative(sop)) {
      groupsToAssign.push(administrativeGroup.id);
    }

    // Ajouter aux groupes multiples si applicable
    if (isMultiGroup(sop)) {
      // Ces procédures apparaissent dans plusieurs groupes
      if (!groupsToAssign.includes(internalGroup.id)) {
        groupsToAssign.push(internalGroup.id);
      }
      if (sop.category && sop.category.toLowerCase().includes('public')) {
        // Les procédures de sécurité/qualité publiques sont aussi dans les internes
        groupsToAssign.push(internalGroup.id);
      }
    }

    // Supprimer les doublons
    const uniqueGroups = [...new Set(groupsToAssign)];
    
    await Promise.all(uniqueGroups.map(groupId =>
      prisma.sopAccessGroup.create({
        data: {
          sopId: createdSop.id,
          accessGroupId: groupId
        }
      })
    ));
  }

  console.log('✅ Seeding terminé avec succès !');
  
  // Afficher un résumé détaillé
  const groupSummary = await prisma.accessGroup.findMany({
    include: {
      _count: {
        select: {
          sops: true,
          users: true
        }
      },
      sops: {
        include: {
          sop: {
            select: {
              title: true
            }
          }
        }
      }
    }
  });

  console.log('\n📊 Résumé des groupes d\'accès:');
  groupSummary.forEach(group => {
    console.log(`\n• ${group.name}: ${group._count.sops} SOPs, ${group._count.users} utilisateurs`);
    if (group._count.sops <= 10) {
      // Afficher les titres pour les groupes avec peu de SOPs
      group.sops.forEach(sopGroup => {
        console.log(`  - ${sopGroup.sop.title}`);
      });
    }
  });

  // Afficher les procédures qui sont dans plusieurs groupes
  console.log('\n🔄 Procédures assignées à plusieurs groupes:');
  const multiGroupSops = await prisma.sop.findMany({
    where: {
      accessGroups: {
        some: {
          accessGroupId: {
            in: [internalGroup.id, publicGroup.id, administrativeGroup.id]
          }
        }
      }
    },
    include: {
      accessGroups: {
        include: {
          accessGroup: {
            select: {
              name: true
            }
          }
        }
      }
    }
  });

  multiGroupSops.forEach(sop => {
    if (sop.accessGroups.length > 1) {
      const groupNames = sop.accessGroups.map(ag => ag.accessGroup.name).join(', ');
      console.log(`  • ${sop.title} → [${groupNames}]`);
    }
  });
}

main()
  .catch(e => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 