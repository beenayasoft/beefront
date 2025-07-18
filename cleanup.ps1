# Script PowerShell pour nettoyer les anciens fichiers du service devis
# et renommer les nouveaux fichiers

# Fonction pour afficher les messages avec couleur
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

# Afficher un message de début
Write-ColorOutput Green "Début du nettoyage des anciens fichiers du service devis..."

# 1. Suppression des anciens fichiers de composants
$oldComponentFiles = @(
    ".\src\components\quotes\QuoteAlerts.tsx",
    ".\src\components\quotes\QuoteFilters.tsx",
    ".\src\components\quotes\QuoteList.tsx",
    ".\src\components\quotes\QuotePreview.tsx",
    ".\src\components\quotes\QuoteStats.tsx",
    ".\src\components\quotes\QuoteTabs.tsx",
    ".\src\components\quotes\editor\DraggableQuoteItem.tsx",
    ".\src\components\quotes\editor\QuoteEditorHeader.tsx",
    ".\src\components\quotes\editor\QuoteItemForm.tsx",
    ".\src\components\quotes\list\QuotesList.tsx",
    ".\src\components\quotes\list\QuotesTabs.tsx"
)

foreach ($file in $oldComponentFiles) {
    if (Test-Path $file) {
        Write-ColorOutput Yellow "Suppression de $file"
        Remove-Item $file -Force
    } else {
        Write-ColorOutput Gray "Fichier $file déjà supprimé ou inexistant"
    }
}

# 2. Suppression des anciennes pages
$oldPageFiles = @(
    ".\src\pages\Devis.tsx",
    ".\src\pages\DevisNew.tsx",
    ".\src\pages\QuoteDetail.tsx",
    ".\src\pages\QuoteEditor.tsx",
    ".\src\pages\QuotePreview.tsx"
)

foreach ($file in $oldPageFiles) {
    if (Test-Path $file) {
        Write-ColorOutput Yellow "Suppression de $file"
        Remove-Item $file -Force
    } else {
        Write-ColorOutput Gray "Fichier $file déjà supprimé ou inexistant"
    }
}

# 3. Suppression des anciens fichiers API
$oldApiFiles = @(
    ".\src\lib\api\quotes.ts"
)

foreach ($file in $oldApiFiles) {
    if (Test-Path $file) {
        Write-ColorOutput Yellow "Suppression de $file"
        Remove-Item $file -Force
    } else {
        Write-ColorOutput Gray "Fichier $file déjà supprimé ou inexistant"
    }
}

# 4. Renommer les nouveaux fichiers (enlever le .new)
$newFiles = Get-ChildItem -Path ".\src" -Recurse -Filter "*.new.*" 

foreach ($file in $newFiles) {
    $newName = $file.FullName -replace "\.new\.", "."
    Write-ColorOutput Cyan "Renommage de $($file.FullName) vers $newName"
    
    # Vérifier si le fichier de destination existe déjà
    if (Test-Path $newName) {
        Write-ColorOutput Red "Le fichier $newName existe déjà, suppression avant renommage"
        Remove-Item $newName -Force
    }
    
    # Renommer le fichier
    Rename-Item -Path $file.FullName -NewName $newName -Force
}

# 5. Mise à jour des imports dans les fichiers
Write-ColorOutput Green "Mise à jour des imports dans les fichiers..."
$filesToUpdate = Get-ChildItem -Path ".\src" -Recurse -Include "*.ts", "*.tsx" | Where-Object { $_.FullName -notlike "*\node_modules\*" }

foreach ($file in $filesToUpdate) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Remplacer les imports .new par des imports normaux
    $updatedContent = $content -replace "from ['""](.+)\.new(['""])", "from `$1`$2"
    
    # Écrire le contenu mis à jour si des changements ont été effectués
    if ($content -ne $updatedContent) {
        Write-ColorOutput Magenta "Mise à jour des imports dans $($file.FullName)"
        Set-Content -Path $file.FullName -Value $updatedContent
    }
}

Write-ColorOutput Green "Nettoyage terminé avec succès!"
