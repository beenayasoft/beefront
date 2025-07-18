import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { MainLayout } from "@/layouts/MainLayout";
import Auth from "@/pages/Auth";
import Index from "@/pages/Dashboard";
import Agenda from "@/pages/Agenda";
import Chantiers from "@/pages/Chantiers";
import DevisNew from "@/pages/DevisNew";
import QuoteEditor from "@/pages/QuoteEditor";
import QuoteDetail from "@/pages/QuoteDetail";
import QuotePreview from "@/pages/QuotePreview";
import Factures from "@/pages/Factures";
import InvoiceDetail from "@/pages/InvoiceDetail";
import InvoiceEditor from "@/pages/InvoiceEditor";
import InvoicePreview from "@/pages/InvoicePreview";
import Interventions from "@/pages/Interventions";
import Stock from "@/pages/Stock";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import Tiers from "@/pages/Tiers";
import TierDetail from "@/pages/TierDetail";
import WorkLibrary from "@/pages/WorkLibrary";
import MaterialDetail from "@/pages/MaterialDetail";
import LaborDetail from "@/pages/LaborDetail";
import WorkDetail from "@/pages/WorkDetail";
import Opportunities from "@/pages/Opportunities";
import OpportunityDetail from "@/pages/OpportunityDetail";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ReactNode } from "react";

// Composant pour protéger les routes
interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }
  
  // Rediriger vers la page d'authentification si l'utilisateur n'est pas connecté
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  // Afficher le contenu protégé si l'utilisateur est authentifié
  return <>{children}</>;
};

// Composant pour rediriger les utilisateurs déjà authentifiés depuis la page d'authentification
const AuthRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth routes - rediriger si déjà connecté */}
            <Route path="/auth" element={
              <AuthRoute>
                <Auth />
              </AuthRoute>
            } />

            {/* Main app routes - protégées */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Index />} />
              <Route path="agenda" element={<Agenda />} />
              <Route path="opportunities" element={<Opportunities />} />
              <Route path="opportunities/:id" element={<OpportunityDetail />} />
              <Route path="chantiers" element={<Chantiers />} />
              <Route path="devis" element={<DevisNew />} />
              <Route path="devis/nouveau" element={<QuoteEditor />} />
              <Route path="devis/edit/:id" element={<QuoteEditor />} />
              <Route path="devis/preview/:id" element={<QuotePreview />} />
              <Route path="devis/:id" element={<QuoteDetail />} />

              <Route path="factures" element={<Factures />} />
              <Route path="factures/:id" element={<InvoiceDetail />} />
              <Route path="factures/edit/:id" element={<InvoiceEditor />} />
              <Route path="factures/preview/:id" element={<InvoicePreview />} />
              <Route path="interventions" element={<Interventions />} />
              <Route path="stock" element={<Stock />} />
              <Route path="settings" element={<Settings />} />
              <Route path="tiers" element={<Tiers />} />
              <Route path="tiers/:id" element={<TierDetail />} />
              <Route path="bibliotheque" element={<WorkLibrary />} />
              <Route path="bibliotheque/materiau/:id" element={<MaterialDetail />} />
              <Route path="bibliotheque/main-oeuvre/:id" element={<LaborDetail />} />
              <Route path="bibliotheque/ouvrage/:id" element={<WorkDetail />} />
            </Route>

            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}