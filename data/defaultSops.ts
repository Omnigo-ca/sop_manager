export interface SOP {
  id: string
  title: string
  description: string
  instructions: string
  author: string
  category: string
  priority: "low" | "medium" | "high" | "critical"
  tags: string[]
  createdAt: string
  updatedAt: string
  editedAt?: string
  steps: { text: string; image: string }[]
}

export const defaultSops: SOP[] = [
  {
    id: "sop-001",
    title: "Audit SEO technique d'un site web",
    description: "Procédure complète pour effectuer un audit technique SEO et identifier les problèmes d'optimisation",
    instructions: `1. Utiliser Screaming Frog pour crawler le site
   - Configurer les paramètres de crawl (limite de pages, profondeur)
   - Analyser les codes de statut HTTP
   - Identifier les pages en erreur 404

2. Vérifier la structure technique
   - Contrôler le fichier robots.txt
   - Vérifier le sitemap XML
   - Analyser la vitesse de chargement avec PageSpeed Insights
   - Tester la compatibilité mobile avec Mobile-Friendly Test

3. Analyser l'architecture du site
   - Vérifier la structure des URLs
   - Contrôler la profondeur des pages
   - Analyser le maillage interne

4. Rédiger le rapport d'audit
   - Lister les problèmes par ordre de priorité
   - Proposer des recommandations concrètes
   - Estimer l'impact et la difficulté de chaque correction`,
    steps: [
      {
        text: "Utiliser Screaming Frog pour crawler le site",
        image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Configurer les paramètres de crawl (limite de pages, profondeur)",
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Analyser les codes de statut HTTP",
        image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Identifier les pages en erreur 404",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Contrôler le fichier robots.txt",
        image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80"
      }
    ],
    author: "Sophie Martin",
    category: "SEO",
    priority: "high",
    tags: ["audit", "technique", "optimisation", "analysis"],
    createdAt: "2024-01-15T09:00:00.000Z",
    updatedAt: "2024-01-15T09:00:00.000Z"
  },
  {
    id: "sop-002",
    title: "Création et programmation de contenu sur les réseaux sociaux",
    description: "Guide pour planifier, créer et programmer du contenu engageant sur les différentes plateformes sociales",
    instructions: `1. Recherche et planification
   - Analyser les tendances du secteur avec Google Trends
   - Identifier les hashtags pertinents avec Hashtagify
   - Planifier le calendrier éditorial mensuel

2. Création du contenu
   - Respecter les dimensions optimales par plateforme
   - Utiliser Canva ou Adobe Creative Suite pour les visuels
   - Rédiger des copies adaptées à chaque réseau social
   - Créer des variations A/B pour tester l'engagement

3. Programmation et publication
   - Utiliser Hootsuite ou Buffer pour programmer
   - Planifier aux heures de forte audience
   - Vérifier l'aperçu sur chaque plateforme

4. Suivi et engagement
   - Surveiller les commentaires dans les 2h après publication
   - Répondre aux interactions dans les 4h
   - Analyser les performances avec les analytics natifs`,
    author: "Thomas Dubois",
    category: "Social Media",
    priority: "medium",
    tags: ["contenu", "programmation", "engagement", "planification"],
    createdAt: "2024-01-18T14:30:00.000Z",
    updatedAt: "2024-01-18T14:30:00.000Z",
    steps: [
      {
        text: "Analyser les tendances du secteur avec Google Trends",
        image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Identifier les hashtags pertinents avec Hashtagify",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Planifier le calendrier éditorial mensuel",
        image: "https://images.unsplash.com/photo-1461344577544-4e5dc9487184?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Respecter les dimensions optimales par plateforme",
        image: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Utiliser Canva ou Adobe Creative Suite pour les visuels",
        image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80"
      }
    ]
  },
  {
    id: "sop-003",
    title: "Configuration et optimisation de campagnes Google Ads",
    description: "Procédure détaillée pour créer et optimiser des campagnes publicitaires Google Ads performantes",
    instructions: `1. Recherche et analyse préliminaire
   - Effectuer une recherche de mots-clés avec Keyword Planner
   - Analyser la concurrence avec SEMrush ou Ahrefs
   - Définir les objectifs et KPIs de la campagne

2. Structure de la campagne
   - Créer des groupes d'annonces thématiques
   - Rédiger 3-4 annonces par groupe d'annonces
   - Configurer les extensions d'annonces (sitelinks, callouts, etc.)

3. Configuration du ciblage
   - Définir les emplacements géographiques
   - Paramétrer les audiences et démographies
   - Configurer les horaires de diffusion optimaux

4. Paramètres d'enchères et budget
   - Définir la stratégie d'enchères selon l'objectif
   - Configurer le budget quotidien recommandé
   - Mettre en place le suivi des conversions

5. Lancement et optimisation
   - Surveiller les performances les 48h premières heures
   - Ajuster les enchères selon les performances
   - Ajouter des mots-clés négatifs si nécessaire
   - Optimiser les annonces peu performantes`,
    author: "Marie Leroy",
    category: "PPC",
    priority: "critical",
    tags: ["google-ads", "ppc", "optimisation", "roi"],
    createdAt: "2024-01-20T10:15:00.000Z",
    updatedAt: "2024-01-20T10:15:00.000Z",
    steps: [
      {
        text: "Effectuer une recherche de mots-clés avec Keyword Planner",
        image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Analyser la concurrence avec SEMrush ou Ahrefs",
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Définir les objectifs et KPIs de la campagne",
        image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Créer des groupes d'annonces thématiques",
        image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Rédiger 3-4 annonces par groupe d'annonces",
        image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80"
      }
    ]
  },
  {
    id: "sop-004",
    title: "Création et optimisation d'articles de blog SEO",
    description: "Méthode pour rédiger des articles de blog optimisés pour le référencement naturel et l'engagement",
    instructions: `1. Recherche de mots-clés et sujet
   - Identifier le mot-clé principal avec Ubersuggest ou SEMrush
   - Rechercher les mots-clés secondaires et LSI
   - Analyser les articles concurrents dans le top 10 Google

2. Structure et rédaction
   - Créer un titre accrocheur avec le mot-clé principal
   - Structurer l'article avec des H2/H3 optimisés
   - Rédiger une introduction engageante (150-200 mots)
   - Développer le contenu (min. 1500 mots pour la compétition)

3. Optimisation SEO on-page
   - Placer le mot-clé dans l'URL, titre, meta-description
   - Optimiser les images (noms de fichiers, alt text)
   - Ajouter des liens internes pertinents
   - Créer un maillage vers des pages importantes

4. Finalisation et publication
   - Relire et corriger les fautes (Grammarly)
   - Ajouter un call-to-action en fin d'article
   - Planifier la promotion sur les réseaux sociaux
   - Soumettre l'URL à Google Search Console`,
    author: "Julien Rousseau",
    category: "Content Marketing",
    priority: "medium",
    tags: ["seo", "rédaction", "blog", "contenu"],
    createdAt: "2024-01-22T16:45:00.000Z",
    updatedAt: "2024-01-22T16:45:00.000Z",
    steps: [
      {
        text: "Identifier le mot-clé principal avec Ubersuggest ou SEMrush",
        image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Rechercher les mots-clés secondaires et LSI",
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Analyser les articles concurrents dans le top 10 Google",
        image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Créer un titre accrocheur avec le mot-clé principal",
        image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Structurer l'article avec des H2/H3 optimisés",
        image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80"
      }
    ]
  },
  {
    id: "sop-005",
    title: "Gestion de crise sur les réseaux sociaux",
    description: "Protocole d'urgence pour gérer efficacement une crise de réputation sur les plateformes sociales",
    instructions: `1. Évaluation immédiate (dans l'heure)
   - Identifier la source et l'ampleur de la crise
   - Capturer des screenshots de tous les contenus concernés
   - Évaluer le niveau de gravité (1-5)
   - Alerter immédiatement le responsable marketing

2. Réponse d'urgence (dans les 2h)
   - Préparer une réponse officielle avec l'équipe juridique
   - Publier un message de reconnaissance si nécessaire
   - Éviter de supprimer les commentaires négatifs légitimes
   - Activer la surveillance renforcée des mentions

3. Communication de crise
   - Répondre de manière transparente et authentique
   - Présenter des excuses sincères si l'entreprise est en tort
   - Proposer des solutions concrètes
   - Diriger les conversations vers des canaux privés si possible

4. Suivi et récupération
   - Surveiller l'évolution du sentiment pendant 7 jours
   - Publier du contenu positif pour reprendre le contrôle
   - Analyser les causes racines pour éviter la récurrence
   - Rédiger un rapport post-crise avec les leçons apprises`,
    author: "Claire Moreau",
    category: "Social Media",
    priority: "critical",
    tags: ["crise", "réputation", "urgence", "communication"],
    createdAt: "2024-01-25T11:20:00.000Z",
    updatedAt: "2024-01-25T11:20:00.000Z",
    steps: [
      {
        text: "Identifier la source et l'ampleur de la crise",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Capturer des screenshots de tous les contenus concernés",
        image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Évaluer le niveau de gravité (1-5)",
        image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Alerter immédiatement le responsable marketing",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Préparer une réponse officielle avec l'équipe juridique",
        image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80"
      }
    ]
  },
  {
    id: "sop-006",
    title: "Création et envoi de campagnes email marketing",
    description: "Processus complet pour concevoir, créer et envoyer des campagnes email efficaces",
    instructions: `1. Planification de la campagne
   - Définir l'objectif (promotion, newsletter, nurturing)
   - Segmenter la base de données selon les critères pertinents
   - Planifier la fréquence et le timing d'envoi optimal

2. Conception du contenu
   - Rédiger un objet accrocheur (max 50 caractères)
   - Créer un template responsive avec Mailchimp ou Sendinblue
   - Structurer le contenu avec un seul CTA principal
   - Personnaliser le contenu selon les segments

3. Tests et optimisation
   - Effectuer des tests A/B sur l'objet et le contenu
   - Tester l'affichage sur différents clients email
   - Vérifier tous les liens et boutons CTA
   - Tester la version mobile

4. Envoi et suivi
   - Programmer l'envoi aux heures optimales
   - Surveiller le taux de délivrabilité
   - Analyser les métriques (ouverture, clic, conversion)
   - Nettoyer la liste des emails inactifs/rebonds`,
    author: "Antoine Bernard",
    category: "Email Marketing",
    priority: "medium",
    tags: ["email", "newsletter", "segmentation", "automation"],
    createdAt: "2024-01-28T13:10:00.000Z",
    updatedAt: "2024-01-28T13:10:00.000Z",
    steps: [
      {
        text: "Définir l'objectif (promotion, newsletter, nurturing)",
        image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Segmenter la base de données selon les critères pertinents",
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Planifier la fréquence et le timing d'envoi optimal",
        image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Rédiger un objet accrocheur (max 50 caractères)",
        image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Créer un template responsive avec Mailchimp ou Sendinblue",
        image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80"
      }
    ]
  },
  {
    id: "sop-007",
    title: "Onboarding d'un nouveau client",
    description: "Procédure d'accueil et d'intégration des nouveaux clients pour assurer un démarrage optimal",
    instructions: `1. Préparation post-signature
   - Créer le dossier client dans le CRM
   - Programmer le kick-off meeting dans les 48h
   - Préparer la documentation d'accueil
   - Assigner l'équipe projet dédiée

2. Kick-off meeting
   - Présenter l'équipe et les rôles de chacun
   - Clarifier les objectifs et attentes du client
   - Définir les KPIs et méthodes de reporting
   - Établir le planning des livrables et points de suivi

3. Collecte d'informations
   - Accès aux comptes (Analytics, Search Console, réseaux sociaux)
   - Brief détaillé sur l'entreprise, concurrents, cible
   - Historique des actions marketing précédentes
   - Guidelines de marque et assets créatifs

4. Mise en place opérationnelle
   - Configuration des outils de tracking et monitoring
   - Création des comptes publicitaires si nécessaire
   - Mise en place des processus de validation
   - Planification du premier rapport dans 2 semaines`,
    author: "Sarah Petit",
    category: "Client Management",
    priority: "high",
    tags: ["onboarding", "client", "process", "kick-off"],
    createdAt: "2024-02-01T09:30:00.000Z",
    updatedAt: "2024-02-01T09:30:00.000Z",
    steps: [
      {
        text: "Créer le dossier client dans le CRM",
        image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Programmer le kick-off meeting dans les 48h",
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Préparer la documentation d'accueil",
        image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Assigner l'équipe projet dédiée",
        image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Présenter l'équipe et les rôles de chacun",
        image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80"
      }
    ]
  },
  {
    id: "sop-008",
    title: "Création de visuels pour les réseaux sociaux",
    description: "Guide de création de contenus visuels cohérents et engageants pour les différentes plateformes",
    instructions: `1. Brief et conceptualisation
   - Analyser le brief client et les objectifs
   - Respecter la charte graphique de la marque
   - Sélectionner les dimensions optimales par plateforme
   - Créer 2-3 concepts différents pour validation

2. Création graphique
   - Utiliser Adobe Creative Suite ou Canva Pro
   - Respecter les guidelines de la marque (couleurs, typographies)
   - Intégrer des éléments visuels de qualité (photos, icônes)
   - Créer des déclinaisons pour chaque réseau social

3. Optimisation et finalisation
   - Vérifier la lisibilité sur mobile
   - Optimiser le poids des fichiers (max 1MB)
   - Créer les formats stories, post carré, et cover
   - Exporter en haute résolution (300 DPI pour print)

4. Validation et archivage
   - Présenter les créations au client pour validation
   - Intégrer les retours et corrections
   - Archiver les fichiers sources dans le drive projet
   - Livrer les fichiers finaux dans tous les formats`,
    author: "Lucas Girard",
    category: "Design",
    priority: "medium",
    tags: ["design", "visuel", "création", "brand"],
    createdAt: "2024-02-05T15:20:00.000Z",
    updatedAt: "2024-02-05T15:20:00.000Z",
    steps: [
      {
        text: "Analyser le brief client et les objectifs",
        image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Respecter la charte graphique de la marque",
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Sélectionner les dimensions optimales par plateforme",
        image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Créer 2-3 concepts différents pour validation",
        image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Utiliser Adobe Creative Suite ou Canva Pro",
        image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80"
      }
    ]
  },
  {
    id: "sop-009",
    title: "Analyse mensuelle des performances digitales",
    description: "Processus d'analyse et de reporting des performances marketing digital pour les clients",
    instructions: `1. Collecte des données
   - Extraire les données de Google Analytics (trafic, conversions)
   - Compiler les métriques des réseaux sociaux
   - Rassembler les performances des campagnes payantes
   - Analyser les positions SEO avec SEMrush/Ahrefs

2. Analyse et insights
   - Comparer les performances vs objectifs définis
   - Identifier les tendances et variations significatives
   - Analyser le ROI de chaque canal marketing
   - Déterminer les opportunités d'optimisation

3. Création du rapport
   - Utiliser le template de rapport standardisé
   - Inclure un executive summary (1 page)
   - Présenter les données avec des graphiques clairs
   - Formuler des recommandations actionables

4. Présentation client
   - Programmer un call de restitution
   - Préparer une présentation de 30 minutes maximum
   - Anticiper les questions et objections
   - Définir les actions prioritaires pour le mois suivant`,
    author: "Emma Lefevre",
    category: "Analytics",
    priority: "high",
    tags: ["analyse", "reporting", "performance", "kpi"],
    createdAt: "2024-02-08T14:00:00.000Z",
    updatedAt: "2024-02-08T14:00:00.000Z",
    steps: [
      {
        text: "Extraire les données de Google Analytics (trafic, conversions)",
        image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Compiler les métriques des réseaux sociaux",
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Rassembler les performances des campagnes payantes",
        image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Analyser les positions SEO avec SEMrush/Ahrefs",
        image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Comparer les performances vs objectifs définis",
        image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80"
      }
    ]
  },
  {
    id: "sop-010",
    title: "Stratégie de netlinking et acquisition de backlinks",
    description: "Méthode pour développer une stratégie de netlinking efficace et acquérir des liens de qualité",
    instructions: `1. Audit du profil de liens existant
   - Analyser les backlinks actuels avec Ahrefs ou Majestic
   - Identifier les liens toxiques à désavouer
   - Évaluer la qualité et la diversité des domaines référents
   - Analyser les stratégies des concurrents

2. Définition de la stratégie
   - Identifier les sites cibles par thématique
   - Prioriser selon l'autorité de domaine et la pertinence
   - Définir les types de contenus à proposer (guest posts, infographies)
   - Planifier le calendrier de prospection

3. Prospection et outreach
   - Rechercher les contacts décisionnaires
   - Personnaliser les emails de prise de contact
   - Proposer du contenu de valeur en échange
   - Suivre les relances selon un planning défini

4. Suivi et optimisation
   - Tracker l'acquisition des nouveaux liens
   - Mesurer l'impact sur les positions SEO
   - Maintenir les relations avec les partenaires
   - Ajuster la stratégie selon les résultats obtenus`,
    author: "Vincent Moreau",
    category: "SEO",
    priority: "medium",
    tags: ["netlinking", "backlinks", "seo-off-page", "outreach"],
    createdAt: "2024-02-12T11:45:00.000Z",
    updatedAt: "2024-02-12T11:45:00.000Z",
    editedAt: "2024-02-15T09:30:00.000Z",
    steps: [
      {
        text: "Analyser les backlinks actuels avec Ahrefs ou Majestic",
        image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Identifier les liens toxiques à désavouer",
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Évaluer la qualité et la diversité des domaines référents",
        image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Analyser les stratégies des concurrents",
        image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80"
      },
      {
        text: "Identifier les sites cibles par thématique",
        image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80"
      }
    ]
  }
] 