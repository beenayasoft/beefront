/**
 * Utilitaires pour améliorer la recherche intelligente
 * Normalisation et correspondance floue pour une meilleure expérience utilisateur
 */

/**
 * Normalise une chaîne de caractères pour la recherche
 * - Supprime les accents
 * - Convertit en minuscules
 * - Supprime les espaces multiples
 * - Supprime les caractères spéciaux
 */
export const normalizeSearchTerm = (text: string): string => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .normalize('NFD') // Décompose les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^\w\s]/g, ' ') // Remplace les caractères spéciaux par des espaces
    .replace(/\s+/g, ' ') // Normalise les espaces multiples
    .trim();
};

/**
 * Calcule un score de correspondance entre une requête et un texte cible
 * Utilise plusieurs critères pour déterminer la pertinence
 */
export const calculateMatchScore = (query: string, target: string): number => {
  if (!query || !target) return 0;
  
  const normalizedQuery = normalizeSearchTerm(query);
  const normalizedTarget = normalizeSearchTerm(target);
  
  // Correspondance exacte (score maximal)
  if (normalizedTarget === normalizedQuery) return 100;
  
  // Correspondance au début (score élevé)
  if (normalizedTarget.startsWith(normalizedQuery)) return 90;
  
  // Contient la requête complète
  if (normalizedTarget.includes(normalizedQuery)) return 80;
  
  // Correspondance par mots
  const queryWords = normalizedQuery.split(' ').filter(w => w.length > 0);
  const targetWords = normalizedTarget.split(' ').filter(w => w.length > 0);
  
  let wordMatches = 0;
  let partialMatches = 0;
  
  for (const queryWord of queryWords) {
    // Mot exact trouvé
    if (targetWords.some(targetWord => targetWord === queryWord)) {
      wordMatches++;
      continue;
    }
    
    // Mot qui commence par la requête
    if (targetWords.some(targetWord => targetWord.startsWith(queryWord))) {
      partialMatches++;
      continue;
    }
    
    // Mot qui contient la requête
    if (targetWords.some(targetWord => targetWord.includes(queryWord))) {
      partialMatches += 0.5;
    }
  }
  
  if (queryWords.length === 0) return 0;
  
  // Calcul du score basé sur les correspondances
  const wordScore = (wordMatches * 2 + partialMatches) / queryWords.length;
  return Math.min(70, wordScore * 35); // Score maximum de 70 pour correspondance partielle
};

/**
 * Filtre et trie les résultats de recherche par pertinence
 */
export const filterAndSortResults = <T>(
  items: T[],
  query: string,
  getSearchableText: (item: T) => string[],
  minScore: number = 10
): T[] => {
  if (!query.trim()) return items;
  
  const scoredItems = items
    .map(item => {
      const searchableTexts = getSearchableText(item);
      const maxScore = Math.max(
        ...searchableTexts.map(text => calculateMatchScore(query, text))
      );
      
      return {
        item,
        score: maxScore
      };
    })
    .filter(({ score }) => score >= minScore)
    .sort((a, b) => b.score - a.score);
  
  return scoredItems.map(({ item }) => item);
};

/**
 * Utilitaire spécialisé pour la recherche de clients
 */
export const searchClients = <T extends { name: string; type?: string }>(
  clients: T[],
  query: string
): T[] => {
  return filterAndSortResults(
    clients,
    query,
    (client) => [
      client.name,
      client.type || ''
    ]
  );
};

/**
 * Met en évidence les termes de recherche dans un texte
 * Utile pour l'affichage des résultats
 */
export const highlightSearchTerms = (text: string, query: string): string => {
  if (!query.trim()) return text;
  
  const normalizedQuery = normalizeSearchTerm(query);
  const queryWords = normalizedQuery.split(' ').filter(w => w.length > 1);
  
  let highlightedText = text;
  
  queryWords.forEach(word => {
    const regex = new RegExp(`(${escapeRegExp(word)})`, 'gi');
    highlightedText = highlightedText.replace(
      regex,
      '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
    );
  });
  
  return highlightedText;
};

/**
 * Échappe les caractères spéciaux pour les expressions régulières
 */
const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};