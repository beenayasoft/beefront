/**
 * Hook personnalisé pour la gestion des moyens de paiement
 */
import { useState, useEffect } from 'react';
import { paymentMethodsAPI } from '../api/paymentMethods';
import type { PaymentMethod, PaymentMethodType } from '../api/paymentMethods';
import { toast } from '@/components/ui/use-toast';

export const usePaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentMethodTypes, setPaymentMethodTypes] = useState<PaymentMethodType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [methods, types] = await Promise.all([
        paymentMethodsAPI.getPaymentMethods(),
        paymentMethodsAPI.getPaymentMethodTypes()
      ]);
      
      setPaymentMethods(methods);
      setPaymentMethodTypes(types);
    } catch (error) {
      console.error('Erreur lors du chargement des moyens de paiement:', error);
      setError('Impossible de charger les moyens de paiement');
      toast({
        title: "Erreur",
        description: "Impossible de charger les moyens de paiement",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createPaymentMethod = async (methodData: Omit<PaymentMethod, 'id'>) => {
    try {
      const newMethod = await paymentMethodsAPI.createPaymentMethod(methodData);
      setPaymentMethods(prev => [...prev, newMethod]);
      
      toast({
        title: "Moyen de paiement créé",
        description: `Le moyen de paiement "${newMethod.label}" a été créé`,
      });
      
      return newMethod;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le moyen de paiement",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePaymentMethod = async (id: number, methodData: Partial<PaymentMethod>) => {
    try {
      const updatedMethod = await paymentMethodsAPI.updatePaymentMethod(id, methodData);
      setPaymentMethods(prev => 
        prev.map(m => m.id === id ? updatedMethod : m)
      );
      
      toast({
        title: "Moyen de paiement modifié",
        description: `Le moyen de paiement "${updatedMethod.label}" a été mis à jour`,
      });
      
      return updatedMethod;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le moyen de paiement",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deletePaymentMethod = async (id: number) => {
    try {
      await paymentMethodsAPI.deletePaymentMethod(id);
      const deletedMethod = paymentMethods.find(m => m.id === id);
      setPaymentMethods(prev => prev.filter(m => m.id !== id));
      
      toast({
        title: "Moyen de paiement supprimé",
        description: deletedMethod ? `Le moyen de paiement "${deletedMethod.label}" a été supprimé` : "Moyen de paiement supprimé",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le moyen de paiement",
        variant: "destructive",
      });
      throw error;
    }
  };

  const createDefaultPaymentMethods = async () => {
    try {
      const result = await paymentMethodsAPI.createDefaultPaymentMethods();
      setPaymentMethods(result.payment_methods);
      
      toast({
        title: "Moyens de paiement créés",
        description: "Les moyens de paiement par défaut ont été créés avec succès",
      });
      
      return result.payment_methods;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer les moyens de paiement par défaut",
        variant: "destructive",
      });
      throw error;
    }
  };

  const reorderPaymentMethods = async (reorderedMethods: PaymentMethod[]) => {
    try {
      // Mettre à jour l'ordre localement d'abord pour une UI réactive
      setPaymentMethods(reorderedMethods);
      
      // Puis sauvegarder les nouveaux ordres sur le serveur
      await Promise.all(
        reorderedMethods.map(method => 
          method.id ? paymentMethodsAPI.updatePaymentMethod(method.id, {
            display_order: method.display_order
          }) : Promise.resolve()
        )
      );
      
      toast({
        title: "Ordre mis à jour",
        description: "L'ordre des moyens de paiement a été sauvegardé",
      });
    } catch (error) {
      // En cas d'erreur, recharger les données
      loadData();
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le nouvel ordre",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    paymentMethods,
    paymentMethodTypes,
    isLoading,
    error,
    actions: {
      loadData,
      createPaymentMethod,
      updatePaymentMethod,
      deletePaymentMethod,
      createDefaultPaymentMethods,
      reorderPaymentMethods
    }
  };
};