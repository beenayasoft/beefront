/**
 * Utilitaires pour la pagination des documents
 */

export interface DocumentItem {
  id: string;
  type: string;
  designation: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalHT: number;
  position: number;
  parentId?: string;
}

export interface PaginationConfig {
  itemsPerPage: number;
  keepChaptersIntact: boolean;
  maxLinesPerItem: number;
}

export interface DocumentPage {
  items: DocumentItem[];
  pageNumber: number;
  totalPages: number;
  hasHeader: boolean;
  hasFooter: boolean;
}

/**
 * Divise une liste d'items en pages en respectant les contraintes de pagination
 */
export function paginateDocumentItems(
  items: DocumentItem[],
  config: PaginationConfig = {
    itemsPerPage: 15,
    keepChaptersIntact: true,
    maxLinesPerItem: 3
  }
): DocumentPage[] {
  const pages: DocumentPage[] = [];
  let currentPageItems: DocumentItem[] = [];
  let currentLineCount = 0;

  const { itemsPerPage, keepChaptersIntact, maxLinesPerItem } = config;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    // Calculer le nombre de lignes que prendra cet item
    let itemLines = 1; // Ligne de base
    if (item.description && item.description.length > 50) {
      itemLines += Math.ceil(item.description.length / 50);
    }
    itemLines = Math.min(itemLines, maxLinesPerItem);

    // Si c'est un chapitre et qu'on veut les garder intacts
    if (item.type === 'chapter' && keepChaptersIntact) {
      // Vérifier combien d'items suivent ce chapitre
      const chapterItems = getChapterItems(items, i);
      const chapterTotalLines = chapterItems.reduce((acc, chapterItem) => {
        let lines = 1;
        if (chapterItem.description && chapterItem.description.length > 50) {
          lines += Math.ceil(chapterItem.description.length / 50);
        }
        return acc + Math.min(lines, maxLinesPerItem);
      }, 0);

      // Si le chapitre entier ne rentre pas dans la page actuelle, commencer une nouvelle page
      if (currentLineCount > 0 && currentLineCount + chapterTotalLines > itemsPerPage) {
        // Finaliser la page actuelle
        pages.push(createDocumentPage(currentPageItems, pages.length + 1, 0));
        currentPageItems = [];
        currentLineCount = 0;
      }
    }

    // Si l'item ne rentre pas dans la page actuelle, commencer une nouvelle page
    if (currentLineCount > 0 && currentLineCount + itemLines > itemsPerPage) {
      pages.push(createDocumentPage(currentPageItems, pages.length + 1, 0));
      currentPageItems = [];
      currentLineCount = 0;
    }

    // Ajouter l'item à la page actuelle
    currentPageItems.push(item);
    currentLineCount += itemLines;
  }

  // Ajouter la dernière page si elle contient des items
  if (currentPageItems.length > 0) {
    pages.push(createDocumentPage(currentPageItems, pages.length + 1, 0));
  }

  // Mettre à jour le nombre total de pages
  return pages.map((page, index) => ({
    ...page,
    totalPages: pages.length
  }));
}

/**
 * Récupère tous les items qui appartiennent à un chapitre
 */
function getChapterItems(items: DocumentItem[], chapterIndex: number): DocumentItem[] {
  const chapterItems: DocumentItem[] = [];
  const chapterId = items[chapterIndex].id;

  for (let i = chapterIndex + 1; i < items.length; i++) {
    const item = items[i];
    
    // Si on rencontre un autre chapitre, on s'arrête
    if (item.type === 'chapter') {
      break;
    }
    
    // Si l'item appartient à ce chapitre
    if (item.parentId === chapterId) {
      chapterItems.push(item);
    }
  }

  return chapterItems;
}

/**
 * Crée un objet DocumentPage
 */
function createDocumentPage(
  items: DocumentItem[],
  pageNumber: number,
  totalPages: number
): DocumentPage {
  return {
    items,
    pageNumber,
    totalPages,
    hasHeader: pageNumber === 1, // En-tête complet seulement sur la première page
    hasFooter: true // Pied de page sur toutes les pages
  };
}

/**
 * Estime la hauteur approximative d'un document en fonction du nombre d'items
 */
export function estimateDocumentHeight(
  items: DocumentItem[],
  config: PaginationConfig = { itemsPerPage: 15, keepChaptersIntact: true, maxLinesPerItem: 3 }
): { totalPages: number; estimatedHeight: string } {
  const pages = paginateDocumentItems(items, config);
  const totalPages = pages.length;
  
  // Hauteur approximative en mm (A4 = 297mm)
  const estimatedHeight = `${totalPages * 297}mm`;
  
  return { totalPages, estimatedHeight };
}