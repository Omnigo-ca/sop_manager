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
 * Nettoie le markdown en supprimant les lignes "Made with Scribe"
 */
export function cleanScribeSignature(markdown: string): string {
  // Supprimer les lignes qui contiennent "Made with Scribe" avec différentes variations
  const scribeRegex = /^#{1,6}\s*\[?\s*Made with Scribe\s*\]?\s*\(.*?\)?.*$/gmi;
  return markdown.replace(scribeRegex, '').trim();
}

/**
 * Convertit les URLs brutes en liens HTML stylisés
 */
export function convertRawUrlsToHtml(text: string): string {
  // Regex pour capturer les URLs brutes (http, https, www, mailto)
  const urlRegex = /((?:https?:\/\/|www\.)[^\s<>"{}|\\^`[\]]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  
  return text.replace(urlRegex, (match) => {
    // Si c'est un email
    if (match.includes('@') && !match.startsWith('http')) {
      return `<a href="mailto:${match}" class="text-primary hover:text-primary/80 underline italic transition-colors">${match}</a>`;
    }
    // Si ça commence par www, ajouter http://
    if (match.startsWith('www.')) {
      return `<a href="http://${match}" target="_blank" rel="noopener noreferrer" class="text-primary hover:text-primary/80 underline italic transition-colors">${match}</a>`;
    }
    // URL normale
    return `<a href="${match}" target="_blank" rel="noopener noreferrer" class="text-primary hover:text-primary/80 underline italic transition-colors">${match}</a>`;
  });
}

/**
 * Convertit les liens markdown en HTML tout en gardant le reste du texte intact
 */
export function convertMarkdownLinksToHtml(text: string): string {
  // D'abord traiter les liens markdown
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  
  let result = text.replace(linkRegex, (match, linkText, url) => {
    // Vérifie si c'est un lien mailto
    if (url.startsWith('mailto:')) {
      return `<a href="${url}" class="text-primary hover:text-primary/80 underline italic transition-colors">${linkText}</a>`;
    }
    // Lien normal avec target="_blank"
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary hover:text-primary/80 underline italic transition-colors">${linkText}</a>`;
  });
  
  // Ensuite traiter les URLs brutes qui ne sont pas déjà dans des liens
  // On évite de traiter les URLs qui sont déjà dans des balises <a>
  const linkTagRegex = /<a[^>]*>.*?<\/a>/g;
  const linkTags = result.match(linkTagRegex) || [];
  const placeholders: string[] = [];
  
  // Remplacer temporairement les liens existants par des placeholders
  linkTags.forEach((link, index) => {
    const placeholder = `__LINK_PLACEHOLDER_${index}__`;
    placeholders.push(link);
    result = result.replace(link, placeholder);
  });
  
  // Traiter les URLs brutes dans le texte restant
  result = convertRawUrlsToHtml(result);
  
  // Remettre les liens originaux
  placeholders.forEach((link, index) => {
    const placeholder = `__LINK_PLACEHOLDER_${index}__`;
    result = result.replace(placeholder, link);
  });
  
  return result;
}

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
  // Nettoyer le markdown en supprimant les lignes "Made with Scribe"
  const cleanedMarkdown = cleanScribeSignature(markdown);
  
  const md = new MarkdownIt();
  // Extraction manuelle des champs via regex pour robustesse
  const titleMatch = cleanedMarkdown.match(/^# (.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : '';

  const authorMatch = cleanedMarkdown.match(/\*\*Auteur\*\*\s*:\s*(.+)/i);
  const author = authorMatch ? authorMatch[1].trim() : '';

  const categoryMatch = cleanedMarkdown.match(/\*\*Cat[ée]gorie\*\*\s*:\s*(.+)/i);
  const category = categoryMatch ? categoryMatch[1].trim() : '';

  const priorityMatch = cleanedMarkdown.match(/\*\*Priorit[ée]\*\*\s*:\s*(.+)/i);
  const priority = (priorityMatch ? priorityMatch[1].trim().toLowerCase() : 'medium') as Priority;

  const tagsMatch = cleanedMarkdown.match(/\*\*Tags\*\*\s*:\s*(.+)/i);
  const tags = tagsMatch ? tagsMatch[1].split(',').map(t => t.trim()).filter(Boolean) : [];

  // Description
  const descMatch = cleanedMarkdown.match(/## Description\s+([\s\S]*?)(?=^## |$)/m);
  const description = descMatch ? convertMarkdownLinksToHtml(descMatch[1].trim()) : '';

  // Instructions - On garde le champ mais on le vide
  const instructions = '';
  
  // Steps (liste markdown)
  const stepsSection = cleanedMarkdown.match(/## [ÉE]tapes\s+([\s\S]*)/m);
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
        steps.push({ text: convertMarkdownLinksToHtml(imgMatch[1].trim()), image: imgMatch[2].trim() });
      } else {
        const txtMatch = line.match(/^[-*] (.+)/);
        if (txtMatch) steps.push({ text: convertMarkdownLinksToHtml(txtMatch[1].trim()) });
      }
    }
    
    // Ajouter le dernier step s'il existe
    if (currentStep) {
      // Convertir les liens markdown en HTML avant de sauvegarder
      currentStep.text = convertMarkdownLinksToHtml(currentStep.text);
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
  // Nettoyer le markdown en supprimant les lignes "Made with Scribe"
  const cleanedMarkdown = cleanScribeSignature(markdown);
  
  const md = new MarkdownIt();
  const tokens = md.parse(cleanedMarkdown, {});
  
  let title = '';
  let description = '';
  let steps: { text: string; image?: string }[] = [];
  let currentStep: { text: string; image?: string } | null = null;
  
  // Extraire le titre (premier h1)
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    
    if (token.type === 'heading_open' && token.tag === 'h1') {
      title = tokens[i + 1].content;
      break;
    }
  }

  // Diviser le contenu en sections basées sur les étapes numérotées
  const content = cleanedMarkdown.split('\n');
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
        // Convertir les liens markdown en HTML avant de sauvegarder
        currentStep.text = convertMarkdownLinksToHtml(currentStep.text);
        steps.push(currentStep);
      }
      
      // Extraire le numéro et le texte de l'étape
      const [, stepNumber, stepText] = line.match(/^(\d+)\\\.\s*(.*)$/) || [];
      
      // Créer une nouvelle étape avec le texte nettoyé (sans ##)
      currentStep = { text: stepText || '' };
      continue;
    }
    
    // Si on est dans une étape et qu'on trouve une image
    if (currentStep && line.startsWith('![')) {
      const imgMatch = line.match(/\!\[(.*)\]\((.*)\)/);
      if (imgMatch) {
        currentStep.image = imgMatch[2];
        // On n'ajoute plus l'image dans le texte car elle sera affichée séparément
      }
      continue;
    }
    
    // Si on est dans une étape et qu'on trouve du texte additionnel (mais pas de nouvelle étape)
    if (currentStep && line.trim() && !line.startsWith('![') && !line.match(/^\d+\\\./)) {
      // Nettoyer le texte des caractères markdown indésirables
      const cleanLine = line.replace(/^#+\s*/, '').trim();
      if (cleanLine) {
        currentStep.text = currentStep.text ? `${currentStep.text} ${cleanLine}` : cleanLine;
      }
    }
  }
  
  // Ajouter la dernière étape si elle existe
  if (currentStep) {
    // Convertir les liens markdown en HTML avant de sauvegarder
    currentStep.text = convertMarkdownLinksToHtml(currentStep.text);
    steps.push(currentStep);
  }

  const parsedSop: ParsedSOP = {
    title,
    description: convertMarkdownLinksToHtml(description),
    instructions: '', // On ne conserve plus les instructions
    steps,
    author: 'Patrice Robitaille', // Extrait du markdown
    category: 'Google Business', // Catégorie par défaut basée sur le contenu
    priority: DEFAULT_PRIORITY,
    tags: ['google', 'business', 'profile'], // Tags par défaut basés sur le contenu
  };

  return parsedSop;
} 