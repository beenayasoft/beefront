import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Material } from "@/features/library/types";
import { libraryApi } from "@/features/library/api";

export function useMaterialDetail(materialId: string | undefined) {
  const navigate = useNavigate();
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    if (materialId) {
      loadMaterial(materialId);
    }
  }, [materialId]);

  const loadMaterial = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await libraryApi.getMaterial(id);
      setMaterial(data);
    } catch (err) {
      console.error("Erreur lors du chargement du matériau:", err);
      setError("Impossible de charger les détails du matériau");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (updatedMaterial: Material) => {
    try {
      if (!material) return;
      
      const saved = await libraryApi.updateMaterial(material.id, updatedMaterial);
      setMaterial(saved);
      setShowEditDialog(false);
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      setError("Erreur lors de la mise à jour du matériau");
    }
  };

  const handleDelete = async () => {
    if (!material || !confirm("Êtes-vous sûr de vouloir supprimer ce matériau ?")) return;
    
    try {
      await libraryApi.deleteMaterial(material.id);
      navigate("/bibliotheque", { replace: true });
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      setError("Erreur lors de la suppression du matériau");
    }
  };

  return {
    material,
    loading,
    error,
    showEditDialog,
    setShowEditDialog,
    handleEdit,
    handleDelete,
    navigate
  };
}