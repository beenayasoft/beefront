import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Material } from "@/features/library/types";
import { libraryApi } from "@/features/library/api";
import { invalidateLibraryCache } from "../utils/cacheUtils";

export function useMaterialDetail(materialId: string | undefined) {
  const navigate = useNavigate();
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
      invalidateLibraryCache('modification matériau depuis détail');
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      setError("Erreur lors de la mise à jour du matériau");
    }
  };

  const handleDelete = () => {
    if (!material) return;
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!material) return;
    
    try {
      setIsDeleting(true);
      await libraryApi.deleteMaterial(material.id);
      invalidateLibraryCache('suppression matériau depuis détail');
      setShowDeleteDialog(false);
      navigate("/bibliotheque", { replace: true });
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      setError("Erreur lors de la suppression du matériau");
      setIsDeleting(false);
    }
  };

  return {
    material,
    loading,
    error,
    showEditDialog,
    setShowEditDialog,
    showDeleteDialog,
    setShowDeleteDialog,
    isDeleting,
    handleEdit,
    handleDelete,
    confirmDelete,
    navigate
  };
}