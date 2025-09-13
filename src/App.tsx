import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy, ReactNode } from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { AuthProvider, useAuth } from "@/features/auth/hooks/useAuth";
import { PageLoader } from "@/components/ui/PageLoader";
import { crmQueryClient } from "@/features/crm/config/queryClient";
import { PageTitleProvider } from "@/components/common/PageTitleProvider";
import { CurrencyProvider } from "@/contexts/CurrencyContext";

// Import statique uniquement pour Auth (nécessaire au démarrage)
import Auth from "@/features/auth/pages/Auth";
import DebugClientSearch from "./debug-client-search";

// Lazy loading OPTIMISÉ - TOUTES les pages depuis features/ (réduction bundle size)
const Index = lazy(() => import("@/pages/Dashboard"));
const Agenda = lazy(() => import("@/pages/Agenda"));
const Chantiers = lazy(() => import("@/pages/Chantiers"));
const Interventions = lazy(() => import("@/pages/Interventions"));
const Stock = lazy(() => import("@/pages/Stock"));
const Settings = lazy(() => import("@/features/settings/pages/Settings"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// ✅ FEATURES - Documents (optimisé)
const DevisNew = lazy(() => import("@/features/documents/pages/DevisNew"));
const Devis = lazy(() => import("@/features/documents/pages/Devis"));
const QuoteEditor = lazy(() => import("@/features/documents/pages/QuoteEditor"));
const QuoteDetail = lazy(() => import("@/features/documents/pages/QuoteDetail"));
const Factures = lazy(() => import("@/features/documents/pages/Factures"));
const InvoiceCreate = lazy(() => import("@/features/documents/pages/InvoiceCreate"));
const InvoiceDetail = lazy(() => import("@/features/documents/pages/InvoiceDetail"));
const InvoiceEditor = lazy(() => import("@/features/documents/pages/InvoiceEditor"));

// ✅ FEATURES - CRM (optimisé)
const Tiers = lazy(() => import("@/features/crm/pages/Tiers"));
const TiersWithReactQuery = lazy(() => import("@/features/crm/pages/TiersWithReactQuery"));
const TierDetail = lazy(() => import("@/features/crm/pages/TierDetail"));
const Opportunities = lazy(() => import("@/features/crm/pages/Opportunities"));
const OpportunityDetail = lazy(() => import("@/features/crm/pages/OpportunityDetail"));

// ✅ FEATURES - Library (déjà optimisé)
const WorkLibrary = lazy(() => import("@/features/library/pages/WorkLibrary"));
const MaterialDetail = lazy(() => import("@/features/library/pages/MaterialDetail"));
const LaborDetail = lazy(() => import("@/features/library/pages/LaborDetail"));
const WorkDetail = lazy(() => import("@/features/library/pages/WorkDetail"));

// ✅ FEATURES - Admin (optimisé)  
const Administration = lazy(() => import("@/features/admin/pages/Administration"));

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
      <QueryClientProvider client={crmQueryClient}>
        <AuthProvider>
          <CurrencyProvider autoInitialize={true}>
            <BrowserRouter>
              <PageTitleProvider />
          <Routes>
            {/* Auth routes - rediriger si déjà connecté */}
            <Route path="/auth" element={
              <AuthRoute>
                <Suspense fallback={<PageLoader />}>
                  <Auth />
                </Suspense>
              </AuthRoute>
            } />

            {/* Main app routes - protégées */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={
                <Suspense fallback={<PageLoader />}>
                  <Index />
                </Suspense>
              } />
              <Route path="agenda" element={
                <Suspense fallback={<PageLoader />}>
                  <Agenda />
                </Suspense>
              } />
              <Route path="opportunities" element={
                <Suspense fallback={<PageLoader />}>
                  <Opportunities />
                </Suspense>
              } />
              <Route path="opportunities/:id" element={
                <Suspense fallback={<PageLoader />}>
                  <OpportunityDetail />
                </Suspense>
              } />
              <Route path="chantiers" element={
                <Suspense fallback={<PageLoader />}>
                  <Chantiers />
                </Suspense>
              } />
              <Route path="debug-clients" element={<DebugClientSearch />} />
              <Route path="devis" element={
                <Suspense fallback={<PageLoader />}>
                  <Devis />
                </Suspense>
              } />
              <Route path="devis/nouveau" element={
                <Suspense fallback={<PageLoader />}>
                  <DevisNew />
                </Suspense>
              } />
              <Route path="devis/edit/:id" element={
                <Suspense fallback={<PageLoader />}>
                  <QuoteEditor />
                </Suspense>
              } />
              <Route path="devis/:id" element={
                <Suspense fallback={<PageLoader />}>
                  <QuoteDetail />
                </Suspense>
              } />

              <Route path="factures" element={
                <Suspense fallback={<PageLoader />}>
                  <Factures />
                </Suspense>
              } />
              <Route path="factures/nouvelle" element={
                <Suspense fallback={<PageLoader />}>
                  <InvoiceCreate />
                </Suspense>
              } />
              <Route path="factures/:id" element={
                <Suspense fallback={<PageLoader />}>
                  <InvoiceDetail />
                </Suspense>
              } />
              <Route path="factures/edit/:id" element={
                <Suspense fallback={<PageLoader />}>
                  <InvoiceEditor />
                </Suspense>
              } />
              <Route path="interventions" element={
                <Suspense fallback={<PageLoader />}>
                  <Interventions />
                </Suspense>
              } />
              <Route path="stock" element={
                <Suspense fallback={<PageLoader />}>
                  <Stock />
                </Suspense>
              } />
              <Route path="settings" element={
                <Suspense fallback={<PageLoader />}>
                  <Settings />
                </Suspense>
              } />
              <Route path="administration" element={
                <Suspense fallback={<PageLoader />}>
                  <Administration />
                </Suspense>
              } />
              <Route path="tiers" element={
                <Suspense fallback={<PageLoader />}>
                  <Tiers />
                </Suspense>
              } />
              <Route path="tiers/:id" element={
                <Suspense fallback={<PageLoader />}>
                  <TierDetail />
                </Suspense>
              } />
              <Route path="bibliotheque" element={
                <Suspense fallback={<PageLoader />}>
                  <WorkLibrary />
                </Suspense>
              } />
              <Route path="bibliotheque/materiau/:id" element={
                <Suspense fallback={<PageLoader />}>
                  <MaterialDetail />
                </Suspense>
              } />
              <Route path="bibliotheque/main-oeuvre/:id" element={
                <Suspense fallback={<PageLoader />}>
                  <LaborDetail />
                </Suspense>
              } />
              <Route path="bibliotheque/ouvrage/:id" element={
                <Suspense fallback={<PageLoader />}>
                  <WorkDetail />
                </Suspense>
              } />
            </Route>

            {/* 404 route */}
            <Route path="*" element={
              <Suspense fallback={<PageLoader />}>
                <NotFound />
              </Suspense>
            } />
            <Route path="*" element={
              <Suspense fallback={<PageLoader />}>
                <NotFound />
              </Suspense>
            } />
          </Routes>
            </BrowserRouter>
          </CurrencyProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}