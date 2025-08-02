/**
 * Utilitaire pour extraire les couleurs dominantes d'une image (logo)
 * et générer automatiquement un thème de couleurs
 */
import ColorThief from 'colorthief';

export interface ExtractedColors {
  primary: string;
  secondary?: string;
  accent?: string;
  palette: string[];
}

/**
 * Extrait les couleurs dominantes d'un fichier image
 * @param logoFile - Fichier image du logo
 * @returns Promise<ExtractedColors> - Couleurs extraites avec couleur primaire recommandée
 */
export const extractColorsFromLogo = async (logoFile: File): Promise<ExtractedColors> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const colorThief = new ColorThief();
    
    img.onload = () => {
      try {
        // Extraire la couleur dominante
        const dominantColor = colorThief.getColor(img);
        
        // Extraire une palette de 6 couleurs
        const palette = colorThief.getPalette(img, 6);
        
        // Convertir les couleurs RGB en format hexadécimal
        const hexPalette = palette.map(rgbToHex);
        const primaryHex = rgbToHex(dominantColor);

        // Sélection intelligente de la couleur primaire
        const primaryColor = selectBestPrimaryColor(primaryHex, hexPalette);
        
        // Couleur secondaire (différente de la primaire)
        const secondaryColor = selectSecondaryColor(hexPalette, primaryColor);
        
        // Couleur d'accent (contrastante)
        const accentColor = selectAccentColor(hexPalette, primaryColor);

        resolve({
          primary: primaryColor,
          secondary: secondaryColor,
          accent: accentColor,
          palette: hexPalette,
        });
        
        // Nettoyage de l'URL d'objet
        URL.revokeObjectURL(img.src);
      } catch (error) {
        console.error('Erreur lors de l\'extraction des couleurs:', error);
        // Retourner une palette par défaut en cas d'erreur
        resolve({
          primary: '#1B333F',
          secondary: '#2563EB',
          accent: '#DC2626',
          palette: ['#1B333F', '#2563EB', '#DC2626'],
        });
      }
    };

    img.onerror = () => {
      reject(new Error('Impossible de charger l\'image'));
    };

    // Créer l'URL d'objet pour l'image
    img.crossOrigin = 'anonymous'; // Pour éviter les erreurs CORS
    img.src = URL.createObjectURL(logoFile);
  });
};

/**
 * Convertit une couleur RGB en format hexadécimal
 */
const rgbToHex = (rgb: [number, number, number]): string => {
  const [r, g, b] = rgb;
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

/**
 * Sélectionne la meilleure couleur primaire basée sur la palette extraite
 */
const selectBestPrimaryColor = (dominantColor: string, palette: string[]): string => {
  // Priorité 1: La couleur dominante si elle a un bon contraste
  if (isGoodContrastColor(dominantColor)) {
    return dominantColor;
  }
  
  // Priorité 2: Chercher dans la palette une couleur avec bon contraste
  for (const color of palette) {
    if (isGoodContrastColor(color)) {
      return color;
    }
  }
  
  // Priorité 3: Prendre la couleur dominante même si le contraste n'est pas optimal
  if (dominantColor) {
    return dominantColor;
  }
  
  // Priorité 4: Première couleur de la palette
  if (palette.length > 0) {
    return palette[0];
  }
  
  // Couleur par défaut si aucune couleur appropriée n'est trouvée
  return '#1B333F';
};

/**
 * Sélectionne une couleur secondaire complémentaire
 */
const selectSecondaryColor = (palette: string[], primaryColor: string): string | undefined => {
  // Éviter la même couleur que la primaire
  const colors = palette.filter(color => color !== primaryColor);
  
  return colors[0];
};

/**
 * Sélectionne une couleur d'accent pour les éléments d'highlight
 */
const selectAccentColor = (palette: string[], primaryColor: string): string | undefined => {
  // Chercher une couleur différente de la primaire
  const colors = palette.filter(color => color !== primaryColor);
  
  // Prendre la deuxième couleur si disponible pour plus de contraste
  return colors[1] || colors[0];
};

/**
 * Vérifie si une couleur a un bon contraste sur fond blanc
 * (pour s'assurer qu'elle sera lisible)
 */
const isGoodContrastColor = (hexColor: string): boolean => {
  // Convertir hex en RGB
  const rgb = hexToRgb(hexColor);
  if (!rgb) return false;
  
  // Calculer la luminance relative
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  
  // Retourner true si la couleur est suffisamment sombre (bon contraste sur fond blanc)
  return luminance < 0.7;
};

/**
 * Convertit une couleur hexadécimale en RGB
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * Génère une version plus claire d'une couleur (pour les backgrounds)
 */
export const lightenColor = (hexColor: string, amount: number = 0.1): string => {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return hexColor;
  
  const lighten = (value: number) => Math.min(255, Math.floor(value + (255 - value) * amount));
  
  const newR = lighten(rgb.r).toString(16).padStart(2, '0');
  const newG = lighten(rgb.g).toString(16).padStart(2, '0');
  const newB = lighten(rgb.b).toString(16).padStart(2, '0');
  
  return `#${newR}${newG}${newB}`;
};

/**
 * Génère une version plus sombre d'une couleur
 */
export const darkenColor = (hexColor: string, amount: number = 0.1): string => {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return hexColor;
  
  const darken = (value: number) => Math.max(0, Math.floor(value * (1 - amount)));
  
  const newR = darken(rgb.r).toString(16).padStart(2, '0');
  const newG = darken(rgb.g).toString(16).padStart(2, '0');
  const newB = darken(rgb.b).toString(16).padStart(2, '0');
  
  return `#${newR}${newG}${newB}`;
};