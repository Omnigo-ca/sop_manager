import MarkdownIt from 'markdown-it';

export interface ParsedSOP {
  title: string;
  description?: string;
  instructions: string;
  steps?: { text: string; image?: string }[];
  author: string;
  authorId?: string;
  category: string;
  priority: string;
  tags: string[];
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
  const md = new MarkdownIt();
  // Extraction manuelle des champs via regex pour robustesse
  const titleMatch = markdown.match(/^# (.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : '';

  const authorMatch = markdown.match(/\*\*Auteur\*\*\s*:\s*(.+)/i);
  const author = authorMatch ? authorMatch[1].trim() : '';

  const categoryMatch = markdown.match(/\*\*Cat[ée]gorie\*\*\s*:\s*(.+)/i);
  const category = categoryMatch ? categoryMatch[1].trim() : '';

  const priorityMatch = markdown.match(/\*\*Priorit[ée]\*\*\s*:\s*(.+)/i);
  const priority = priorityMatch ? priorityMatch[1].trim().toLowerCase() : 'medium';

  const tagsMatch = markdown.match(/\*\*Tags\*\*\s*:\s*(.+)/i);
  const tags = tagsMatch ? tagsMatch[1].split(',').map(t => t.trim()).filter(Boolean) : [];

  // Description
  const descMatch = markdown.match(/## Description\s+([\s\S]*?)(?=^## |$)/m);
  const description = descMatch ? descMatch[1].trim() : '';

  // Instructions
  const instrMatch = markdown.match(/## Instructions\s+([\s\S]*?)(?=^## |$)/m);
  const instructions = instrMatch ? instrMatch[1].trim() : '';

  // Steps (liste markdown)
  const stepsSection = markdown.match(/## [ÉE]tapes\s+([\s\S]*)/m);
  let steps: { text: string; image?: string }[] = [];
  if (stepsSection) {
    const lines = stepsSection[1].split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      // ![texte](url) ou - texte simple
      const imgMatch = line.match(/^[-*] \!\[(.*)\]\((.*)\)/);
      if (imgMatch) {
        steps.push({ text: imgMatch[1].trim(), image: imgMatch[2].trim() });
      } else {
        const txtMatch = line.match(/^[-*] (.+)/);
        if (txtMatch) steps.push({ text: txtMatch[1].trim() });
      }
    }
  }

  if (!title || !author || !instructions) {
    throw new Error('Le markdown ne contient pas tous les champs obligatoires (titre, auteur, instructions).');
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