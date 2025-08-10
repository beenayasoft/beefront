/**
 * Composant qui gère automatiquement les titres des pages
 */
import { useAutoPageTitle } from "@/hooks/usePageTitle";

export const PageTitleProvider = () => {
  useAutoPageTitle();
  return null; // Ce composant ne rend rien visuellement
};