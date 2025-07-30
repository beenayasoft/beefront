import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Labor } from "@/features/library/types";
import { libraryApi } from "@/features/library/api";

export function useLaborDetail(laborId: string | undefined) {
  const navigate = useNavigate();
  const [labor, setLabor] = useState<Labor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    if (laborId) {
      loadLabor(laborId);
    }
  }, [laborId]);

  const loadLabor = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await libraryApi.getLaborItem(id);
      setLabor(data);
    } catch (err) {
      console.error("Erreur lors du chargement de la main d'œuvre:", err);
      setError("Impossible de charger les détails de la main d'œuvre");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (updatedLabor: Labor) => {
    try {
      if (!labor) return;
      
      const saved = await libraryApi.updateLabor(labor.id, updatedLabor);
      setLabor(saved);
      setShowEditDialog(false);
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      setError("Erreur lors de la mise à jour de la main d'œuvre");
    }
  };

  const handleDelete = async () => {
    if (!labor || !confirm("Êtes-vous sûr de vouloir supprimer cette main d'œuvre ?")) return;
    
    try {
      await libraryApi.deleteLabor(labor.id);
      navigate("/bibliotheque", { replace: true });
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      setError("Erreur lors de la suppression de la main d'œuvre");
    }
  };

  return {
    labor,
    loading,
    error,
    showEditDialog,
    setShowEditDialog,
    handleEdit,
    handleDelete,
    navigate
  };
}