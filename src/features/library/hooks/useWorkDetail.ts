import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Work } from "@/features/library/types";
import { libraryApi } from "@/features/library/api";
import { invalidateLibraryCache } from "../utils/cacheUtils";

export function useWorkDetail(workId: string | undefined) {
  const navigate = useNavigate();
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    if (workId) {
      loadWork(workId);
    }
  }, [workId]);

  const loadWork = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await libraryApi.getWork(id);
      setWork(data);
    } catch (err) {
      console.error("Erreur lors du chargement de l'ouvrage:", err);
      setError("Impossible de charger les détails de l'ouvrage");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (updatedWork: Work) => {
    try {
      if (!work) return;
      
      const saved = await libraryApi.updateWork(work.id, updatedWork);
      setWork(saved);
      setShowEditDialog(false);
      invalidateLibraryCache('modification ouvrage depuis détail');
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      setError("Erreur lors de la mise à jour de l'ouvrage");
    }
  };

  const handleDelete = async () => {
    if (!work || !confirm("Êtes-vous sûr de vouloir supprimer cet ouvrage ?")) return;
    
    try {
      await libraryApi.deleteWork(work.id);
      invalidateLibraryCache('suppression ouvrage depuis détail');
      navigate("/bibliotheque", { replace: true });
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      setError("Erreur lors de la suppression de l'ouvrage");
    }
  };

  return {
    work,
    loading,
    error,
    showEditDialog,
    setShowEditDialog,
    handleEdit,
    handleDelete,
    navigate
  };
}