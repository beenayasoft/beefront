import { Quote } from '../types/quotes.types';
import { apiClient } from '@/lib/api/client';

interface QuoteServiceOptions {
  progressive?: boolean;
  includeMetrics?: boolean;
}

interface QuoteServiceResponse {
  quotes: Quote[];
  metrics?: {
    total: number;
    totalAmount: number;
    avgAmount: number;
    byStatus: Record<string, number>;
    acceptanceRate: number;
  };
  source: 'api' | 'mock';
}

export const quotesService = {
  async getQuotesByTier(
    tierId: string,
    options: QuoteServiceOptions = {}
  ): Promise<QuoteServiceResponse> {
    try {
      console.log('📤 [quotesService] Requête API pour tierId:', tierId);
      
      // D'abord récupérer les infos du tier pour obtenir son nom
      const tierResponse = await apiClient.get(`/api/tiers/${tierId}/`);
      const tierName = tierResponse.data.nom;
      console.log('👤 [quotesService] Nom du tier:', tierName);
      
      // Ensuite chercher les devis par nom de client
      console.log('📤 [quotesService] URL:', `/quotes/`);
      console.log('📤 [quotesService] Params:', { client_name: tierName });
      
      const response = await apiClient.get(`/quotes/`, {
        params: { client_name: tierName }
      });

      console.log('📥 [quotesService] Réponse brute:', response.data);
      const quotes = response.data.results || [];
      console.log('📋 [quotesService] Devis extraits:', quotes);

      // Calculer les métriques si demandé
      let metrics;
      if (options.includeMetrics) {
        const totalAmount = quotes.reduce((sum: number, quote: Quote) => sum + quote.totalTtc, 0);
        const acceptedQuotes = quotes.filter(quote => quote.status === 'accepted').length;
        
        metrics = {
          total: quotes.length,
          totalAmount,
          avgAmount: quotes.length > 0 ? totalAmount / quotes.length : 0,
          byStatus: quotes.reduce((acc: Record<string, number>, quote: Quote) => {
            acc[quote.status] = (acc[quote.status] || 0) + 1;
            return acc;
          }, {}),
          acceptanceRate: quotes.length > 0 ? (acceptedQuotes / quotes.length) * 100 : 0
        };
      }

      return {
        quotes,
        metrics,
        source: 'api'
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des devis:', error);
      throw error;
    }
  },

  async createQuote(data: Partial<Quote>): Promise<Quote> {
    try {
      const response = await apiClient.post('/quotes/', data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du devis:', error);
      throw error;
    }
  },

  async updateQuote(id: string, data: Partial<Quote>): Promise<Quote> {
    try {
      const response = await apiClient.put(`/quotes/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du devis:', error);
      throw error;
    }
  },

  async deleteQuote(id: string): Promise<void> {
    try {
      await apiClient.delete(`/quotes/${id}/`);
    } catch (error) {
      console.error('Erreur lors de la suppression du devis:', error);
      throw error;
    }
  },

  async getQuoteById(id: string): Promise<Quote> {
    try {
      const response = await apiClient.get(`/quotes/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du devis:', error);
      throw error;
    }
  }
}; 