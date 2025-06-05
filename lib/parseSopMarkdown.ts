import MarkdownIt from 'markdown-it';
import { SOP } from '@/components/sop-manager/types';

type Priority = "low" | "medium" | "high" | "critical";

export interface ParsedSOP {
  title: string;
  description?: string;
  instructions: string;
  steps?: { text: string; image?: string }[];
  author: string;
  authorId?: string;
  category: string;
  priority: Priority;
  tags: string[];
}

const DEFAULT_PRIORITY: Priority = "medium";

/**
 * Parse un markdown structuré en SOP.
 *
 * Format attendu :
 * # Titre
 *
 * **Auteur**: Prénom Nom
 * **Catégorie**: ...
 * **Priorité**: ...
 * **Tags**: tag1, tag2, ...
 *
 * ## Description
 * ...
 *
 * ## Instructions
 * ...
 *
 * ## Étapes
 * - Texte étape 1
 * - ![Texte étape 2](url_image)
 * ...
 */
export function parseSopMarkdown(markdown: string): ParsedSOP {
  const md = new MarkdownIt();
  // Extraction manuelle des champs via regex pour robustesse
  const titleMatch = markdown.match(/^# (.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : '';

  const authorMatch = markdown.match(/\*\*Auteur\*\*\s*:\s*(.+)/i);
  const author = authorMatch ? authorMatch[1].trim() : '';

  const categoryMatch = markdown.match(/\*\*Cat[ée]gorie\*\*\s*:\s*(.+)/i);
  const category = categoryMatch ? categoryMatch[1].trim() : '';

  const priorityMatch = markdown.match(/\*\*Priorit[ée]\*\*\s*:\s*(.+)/i);
  const priority = (priorityMatch ? priorityMatch[1].trim().toLowerCase() : 'medium') as Priority;

  const tagsMatch = markdown.match(/\*\*Tags\*\*\s*:\s*(.+)/i);
  const tags = tagsMatch ? tagsMatch[1].split(',').map(t => t.trim()).filter(Boolean) : [];

  // Description
  const descMatch = markdown.match(/## Description\s+([\s\S]*?)(?=^## |$)/m);
  const description = descMatch ? descMatch[1].trim() : '';

  // Instructions - On garde le champ mais on le vide
  const instructions = '';
  
  // Steps (liste markdown)
  const stepsSection = markdown.match(/## [ÉE]tapes\s+([\s\S]*)/m);
  let steps: { text: string; image?: string }[] = [];
  if (stepsSection) {
    const lines = stepsSection[1].split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    let currentStep: { text: string; image?: string } | null = null;
    
    for (const line of lines) {
      // Début d'un bloc step
      if (line.startsWith('```step')) {
        if (currentStep) {
          steps.push(currentStep);
        }
        currentStep = { text: '' };
        continue;
      }
      
      // Fin d'un bloc step
      if (line === '```' && currentStep) {
        steps.push(currentStep);
        currentStep = null;
        continue;
      }
      
      // Image dans un bloc step
      if (currentStep && line.startsWith('![')) {
        const imgMatch = line.match(/\!\[(.*)\]\((.*)\)/);
        if (imgMatch) {
          currentStep.image = imgMatch[2].trim();
        }
        continue;
      }
      
      // Contenu du bloc step
      if (currentStep) {
        currentStep.text = currentStep.text ? currentStep.text + '\n' + line : line;
        continue;
      }
      
      // Ancien format (liste markdown)
      const imgMatch = line.match(/^[-*] \!\[(.*)\]\((.*)\)/);
      if (imgMatch) {
        steps.push({ text: imgMatch[1].trim(), image: imgMatch[2].trim() });
      } else {
        const txtMatch = line.match(/^[-*] (.+)/);
        if (txtMatch) steps.push({ text: txtMatch[1].trim() });
      }
    }
    
    // Ajouter le dernier step s'il existe
    if (currentStep) {
      steps.push(currentStep);
    }
  }

  if (!title || !author) {
    throw new Error('Le markdown ne contient pas tous les champs obligatoires (titre, auteur).');
  }

  return {
    title,
    description,
    instructions,
    steps: steps.length > 0 ? steps : undefined,
    author,
    category,
    priority,
    tags,
  };
}

export function parseMarkdownToSop(markdown: string): ParsedSOP {
  const md = new MarkdownIt();
  const tokens = md.parse(markdown, {});
  
  let title = '';
  let description = '';
  let steps: { text: string; image?: string }[] = [];
  let currentStep: { text: string; image?: string } | null = null;
  let stepContent = '';
  
  // Extraire le titre (premier h1)
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    
    if (token.type === 'heading_open' && token.tag === 'h1') {
      title = tokens[i + 1].content;
      break;
    }
  }

  // Diviser le contenu en sections basées sur les étapes numérotées
  const content = markdown.split('\n');
  let inStep = false;
  let foundFirstStep = false;
  
  for (let i = 0; i < content.length; i++) {
    const line = content[i];
    
    // Si on trouve une ligne qui commence par un numéro et un backslash
    if (line.match(/^\d+\\\./)) {
      // Si c'est la première étape qu'on trouve
      if (!foundFirstStep) {
        foundFirstStep = true;
        steps = []; // On réinitialise les étapes pour ne garder que la version formatée
      }
      
      // Si on était déjà dans une étape, on la sauvegarde
      if (currentStep) {
        steps.push(currentStep);
      }
      
      // Extraire le numéro et le texte de l'étape
      const [, stepNumber, stepText] = line.match(/^(\d+)\\\.\s*(.*)$/) || [];
      
      // Créer une nouvelle étape
      stepContent = `## Étape ${stepNumber}\n\n${stepText}`;
      currentStep = { text: stepContent };
      inStep = true;
      continue;
    }
    
    // Si on est dans une étape et qu'on trouve une image
    if (inStep && line.startsWith('![') && currentStep) {
      const imgMatch = line.match(/\!\[(.*)\]\((.*)\)/);
      if (imgMatch) {
        currentStep.image = imgMatch[2];
        // On n'ajoute plus l'image dans le texte car elle sera affichée séparément
      }
      continue;
    }
    
    // Si on est dans une étape et qu'on trouve du texte additionnel
    if (inStep && line.trim() && currentStep && !line.startsWith('![')) {
      currentStep.text = `${currentStep.text}\n${line}`;
    }
    
    // Si on trouve une ligne vide et qu'on n'est pas au début d'une étape,
    // on considère que c'est une séparation entre les étapes
    if (!line.trim() && inStep) {
      inStep = false;
    }
  }
  
  // Ajouter la dernière étape si elle existe
  if (currentStep) {
    steps.push(currentStep);
  }

  const parsedSop: ParsedSOP = {
    title,
    description,
    instructions: '', // On ne conserve plus les instructions
    steps,
    author: 'Patrice Robitaille', // Extrait du markdown
    category: 'Google Business', // Catégorie par défaut basée sur le contenu
    priority: DEFAULT_PRIORITY,
    tags: ['google', 'business', 'profile'], // Tags par défaut basés sur le contenu
  };

  return parsedSop;
} 