import { apiClient } from '@/lib/api/client';
import { WorkComponent } from '../types/workLibrary';
import { transformIngredient } from './transformers';

export const ingredientsApi = {
  // Créer un ingrédient pour un ouvrage
  createIngredient: async (ouvrageId: string, ingredient: {
    elementType: 'fourniture' | 'mainoeuvre';
    elementId: string;
    quantity: number;
    wasteAllowance?: number;
    notes?: string;
  }): Promise<WorkComponent> => {
    try {
      const backendData = {
        ouvrage: Number(ouvrageId),
        element_type_nom: ingredient.elementType,
        element_id: Number(ingredient.elementId),
        quantite: ingredient.quantity.toString(),
        waste_allowance: (ingredient.wasteAllowance || 0).toString(),
        notes: ingredient.notes || '',
      };
      
      const response = await apiClient.post('/api/ingredients/', backendData);
      return transformIngredient(response.data);
    } catch (error) {
      console.error("Erreur lors de la création de l'ingrédient:", error);
      throw error;
    }
  },

  // Mettre à jour un ingrédient
  updateIngredient: async (id: string, updates: {
    quantity?: number;
    wasteAllowance?: number;
    notes?: string;
  }): Promise<WorkComponent> => {
    try {
      const backendData: any = {};
      if (updates.quantity !== undefined) {
        backendData.quantite = updates.quantity.toString();
      }
      if (updates.wasteAllowance !== undefined) {
        backendData.waste_allowance = updates.wasteAllowance.toString();
      }
      if (updates.notes !== undefined) {
        backendData.notes = updates.notes;
      }
      
      const response = await apiClient.patch(`/api/ingredients/${id}/`, backendData);
      return transformIngredient(response.data);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'ingrédient ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un ingrédient
  deleteIngredient: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/ingredients/${id}/`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'ingrédient ${id}:`, error);
      throw error;
    }
  },
};