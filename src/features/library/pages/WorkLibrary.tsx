import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { LibraryItemsList } from "../components/LibraryItemsList";
import { LibraryItemForm } from "../components/LibraryItemForm";
import { WorkCompositionForm } from "../components/WorkCompositionForm";
import { Work, Material, Labor } from "@/features/library/types";

// Nouveaux imports pour les hooks et composants séparés
import { useLibraryData } from "../hooks/useLibraryData";
import { useLibraryFilters } from "../hooks/useLibraryFilters";
import { useLibraryActions } from "../hooks/useLibraryActions";
import { WorkLibraryHeader } from "../components/WorkLibraryHeader";
import { WorkLibraryStats } from "../components/WorkLibraryStats";
import { WorkLibraryFilters } from "../components/WorkLibraryFilters";

const ITEMS_PER_PAGE = 10;

export default function WorkLibrary() {
  // Utilisation des hooks personnalisés
  const libraryData = useLibraryData();
  const { materials, labor, works, loading, error } = libraryData;
  
  const filters = useLibraryFilters(materials, labor, works);
  const {
    filteredItems,
    paginatedItems,
    currentPage,
    searchQuery,
    activeTab,
    sortField,
    sortDirection,
    showAdvancedFilters,
    handleSearch,
    handleSearchChange,
    handleResetFilters,
    handleTabChange,
    handleSort,
    handlePageChange,
    setShowAdvancedFilters,
  } = filters;
  
  const actions = useLibraryActions(libraryData);
  const {
    showTypeSelector,
    showItemForm,
    showWorkForm,
    currentItemType,
    selectedItem,
    setShowTypeSelector,
    handleItemClick,
    handleItemEdit,
    handleAddItem,
    handleCancelForm,
    handleDeleteItem,
    handleSaveItem,
  } = actions;

  // Rendu progressif - pas de fallback bloquant

  return (
    <div className="p-6 space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <WorkLibraryHeader
        showTypeSelector={showTypeSelector}
        setShowTypeSelector={setShowTypeSelector}
        loading={loading}
        onAddItem={handleAddItem}
      />

      {/* Stats */}
      <WorkLibraryStats
        materials={materials}
        labor={labor}
        works={works}
        filteredItemsCount={filteredItems.length}
      />

      {/* Filters */}
      <WorkLibraryFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearch={handleSearch}
        showAdvancedFilters={showAdvancedFilters}
        onToggleAdvancedFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
        activeTab={activeTab}
        sortField={sortField}
        sortDirection={sortDirection}
        onResetFilters={handleResetFilters}
      />

      {/* Main Content */}
      <div className="benaya-card">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <LibraryItemsList
              items={paginatedItems}
              onSearch={handleSearch}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onSort={handleSort}
              onPageChange={handlePageChange}
              totalItems={filteredItems.length}
              currentPage={currentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              showFilters={showAdvancedFilters}
              onToggleFilters={(show) => setShowAdvancedFilters(show)}
              allMaterials={materials}
              allLabor={labor}
              allWorks={works}
              onItemClick={handleItemClick}
              onItemEdit={handleItemEdit}
              isLoading={loading}
            />
          </div>
        </div>
      </div>

      {/* Dialogue de formulaire pour matériau/main d'œuvre */}
      <Dialog open={showItemForm} onOpenChange={actions.setShowItemForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Le DialogTitle est géré par LibraryItemForm */}
          <LibraryItemForm
            item={selectedItem as Material | Labor}
            type={currentItemType as "material" | "labor"}
            onSave={handleSaveItem}
            onCancel={handleCancelForm}
          />
        </DialogContent>
      </Dialog>

      {/* Dialogue de formulaire pour ouvrage */}
      <Dialog open={showWorkForm} onOpenChange={actions.setShowWorkForm}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sr-only">
            <DialogTitle>
              {selectedItem ? `Modifier ${selectedItem.name}` : "Créer un ouvrage"}
            </DialogTitle>
            <DialogDescription>
              Formulaire de création ou modification d'un ouvrage
            </DialogDescription>
          </DialogHeader>
          <WorkCompositionForm
            work={selectedItem as Work}
            availableMaterials={materials}
            availableLabor={labor}
            availableWorks={works.filter(w => !selectedItem || w.id !== selectedItem.id)} // Éviter les références circulaires
            onSave={handleSaveItem}
            onCancel={handleCancelForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

