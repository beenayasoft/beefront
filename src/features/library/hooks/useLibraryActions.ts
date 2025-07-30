import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Work, Material, Labor } from '../types/workLibrary';
import { libraryApi } from '../api/library';
import { UseLibraryDataReturn } from './useLibraryData';

export interface UseLibraryActionsReturn {
  // État des dialogues
  showTypeSelector: boolean;
  showItemForm: boolean;
  showWorkForm: boolean;
  currentItemType: "material" | "labor" | "work";
  selectedItem: Work | Material | Labor | null;
  
  // Actions pour les dialogues
  setShowTypeSelector: React.Dispatch<React.SetStateAction<boolean>>;
  setShowItemForm: React.Dispatch<React.SetStateAction<boolean>>;
  setShowWorkForm: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentItemType: React.Dispatch<React.SetStateAction<"material" | "labor" | "work">>;
  setSelectedItem: React.Dispatch<React.SetStateAction<Work | Material | Labor | null>>;
  
  // Gestionnaires d'événements
  handleItemClick: (item: Work | Material | Labor) => void;
  handleItemEdit: (item: Work | Material | Labor) => void;
  handleAddItem: (type: "material" | "labor" | "work") => void;
  handleCancelForm: () => void;
  handleDeleteItem: () => Promise<void>;
  handleSaveItem: (item: Material | Labor | Work) => Promise<void>;
}

export function useLibraryActions(libraryData: UseLibraryDataReturn): UseLibraryActionsReturn {
  const navigate = useNavigate();
  const { 
    materials, 
    labor, 
    works, 
    setMaterials, 
    setLabor, 
    setWorks, 
    setLoading, 
    setError 
  } = libraryData;

  // État pour les dialogues
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showWorkForm, setShowWorkForm] = useState(false);
  const [currentItemType, setCurrentItemType] = useState<"material" | "labor" | "work">("material");
  const [selectedItem, setSelectedItem] = useState<Work | Material | Labor | null>(null);

  const handleItemClick = (item: Work | Material | Labor) => {
    // Naviguer vers la page de détail appropriée
    if ("components" in item) {
      navigate(`/bibliotheque/ouvrage/${item.id}`);
    } else if ("vatRate" in item) {
      navigate(`/bibliotheque/materiau/${item.id}`);
    } else {
      navigate(`/bibliotheque/main-oeuvre/${item.id}`);
    }
  };

  const handleItemEdit = (item: Work | Material | Labor) => {
    setSelectedItem(item);
    
    if ("components" in item) {
      setCurrentItemType("work");
      setShowWorkForm(true);
    } else if ("vatRate" in item) {
      setCurrentItemType("material");
      setShowItemForm(true);
    } else {
      setCurrentItemType("labor");
      setShowItemForm(true);
    }
  };

  const handleAddItem = (type: "material" | "labor" | "work") => {
    setSelectedItem(null);
    setCurrentItemType(type);
    setShowTypeSelector(false); // Fermer la modale de sélection de type
    
    if (type === "work") {
      setShowWorkForm(true);
    } else {
      setShowItemForm(true);
    }
  };

  // Fonction pour gérer l'annulation et fermer toutes les modales
  const handleCancelForm = () => {
    setShowItemForm(false);
    setShowWorkForm(false);
    setShowTypeSelector(false);
    setSelectedItem(null);
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    
    try {
      setLoading(true);
      
      if ("components" in selectedItem) {
        await libraryApi.deleteWork(selectedItem.id);
        setWorks(works.filter(w => w.id !== selectedItem.id));
      } else if ("vatRate" in selectedItem) {
        await libraryApi.deleteMaterial(selectedItem.id);
        setMaterials(materials.filter(m => m.id !== selectedItem.id));
      } else {
        await libraryApi.deleteLabor(selectedItem.id);
        setLabor(labor.filter(l => l.id !== selectedItem.id));
      }
      
      setSelectedItem(null);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setError("Erreur lors de la suppression de l'élément");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async (item: Material | Labor | Work) => {
    try {
      setLoading(true);
      
      if ("components" in item) {
        // C'est un ouvrage
        const workItem = item as Work;
        const existingIndex = works.findIndex(w => w.id === workItem.id);
        const isNew = !workItem.id || existingIndex === -1;
        
        let savedWork: Work;
        if (isNew) {
          // Ajout d'un nouvel ouvrage
          savedWork = await libraryApi.createWork(workItem);
          setWorks([...works, savedWork]);
          
          // Fermer toutes les modales et rediriger vers la page de détail
          setShowWorkForm(false);
          setShowTypeSelector(false);
          setSelectedItem(null);
          navigate(`/bibliotheque/ouvrage/${savedWork.id}`);
          return; // Sortir de la fonction pour éviter la logique de mise à jour
        } else {
          // Mise à jour d'un ouvrage existant
          savedWork = await libraryApi.updateWork(workItem.id, workItem);
          const updatedWorks = [...works];
          updatedWorks[existingIndex] = savedWork;
          setWorks(updatedWorks);
        }
        
        setShowWorkForm(false);
      } else if ("vatRate" in item) {
        // C'est un matériau
        const materialItem = item as Material;
        const existingIndex = materials.findIndex(m => m.id === materialItem.id);
        const isNew = !materialItem.id || existingIndex === -1;
        
        let savedMaterial: Material;
        if (isNew) {
          // Ajout d'un nouveau matériau
          savedMaterial = await libraryApi.createMaterial(materialItem);
          setMaterials([...materials, savedMaterial]);
          
          // Fermer toutes les modales et rediriger vers la page de détail
          setShowItemForm(false);
          setShowTypeSelector(false);
          setSelectedItem(null);
          navigate(`/bibliotheque/materiau/${savedMaterial.id}`);
          return; // Sortir de la fonction pour éviter la logique de mise à jour
        } else {
          // Mise à jour d'un matériau existant
          savedMaterial = await libraryApi.updateMaterial(materialItem.id, materialItem);
          const updatedMaterials = [...materials];
          updatedMaterials[existingIndex] = savedMaterial;
          setMaterials(updatedMaterials);
        }
        
        setShowItemForm(false);
      } else {
        // C'est de la main d'œuvre
        const laborItem = item as Labor;
        const existingIndex = labor.findIndex(l => l.id === laborItem.id);
        const isNew = !laborItem.id || existingIndex === -1;
        
        let savedLabor: Labor;
        if (isNew) {
          // Ajout d'une nouvelle main d'œuvre
          savedLabor = await libraryApi.createLabor(laborItem);
          setLabor([...labor, savedLabor]);
          
          // Fermer toutes les modales et rediriger vers la page de détail
          setShowItemForm(false);
          setShowTypeSelector(false);
          setSelectedItem(null);
          navigate(`/bibliotheque/main-oeuvre/${savedLabor.id}`);
          return; // Sortir de la fonction pour éviter la logique de mise à jour
        } else {
          // Mise à jour d'une main d'œuvre existante
          savedLabor = await libraryApi.updateLabor(laborItem.id, laborItem);
          const updatedLabor = [...labor];
          updatedLabor[existingIndex] = savedLabor;
          setLabor(updatedLabor);
        }
        
        setShowItemForm(false);
      }
      
      setSelectedItem(null);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      setError("Erreur lors de la sauvegarde de l'élément");
    } finally {
      setLoading(false);
    }
  };

  return {
    // État des dialogues
    showTypeSelector,
    showItemForm,
    showWorkForm,
    currentItemType,
    selectedItem,
    
    // Actions pour les dialogues
    setShowTypeSelector,
    setShowItemForm,
    setShowWorkForm,
    setCurrentItemType,
    setSelectedItem,
    
    // Gestionnaires d'événements
    handleItemClick,
    handleItemEdit,
    handleAddItem,
    handleCancelForm,
    handleDeleteItem,
    handleSaveItem,
  };
}