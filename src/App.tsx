import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { lazy, Suspense, ReactNode } from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

// Lazy load all pages for better performance
const Auth = lazy(() => import("@/pages/Auth"));
const Index = lazy(() => import("@/pages/Dashboard"));
const Agenda = lazy(() => import("@/pages/Agenda"));
const Chantiers = lazy(() => import("@/pages/Chantiers"));
const DevisNew = lazy(() => import("@/pages/DevisNew"));
const QuoteEditor = lazy(() => import("@/pages/QuoteEditor"));
const QuoteDetail = lazy(() => import("@/pages/QuoteDetail"));
const QuotePreview = lazy(() => import("@/pages/QuotePreview"));
const Factures = lazy(() => import("@/pages/Factures"));
const InvoiceDetail = lazy(() => import("@/pages/InvoiceDetail"));
const InvoiceEditor = lazy(() => import("@/pages/InvoiceEditor"));
const InvoicePreview = lazy(() => import("@/pages/InvoicePreview"));
const Interventions = lazy(() => import("@/pages/Interventions"));
const Stock = lazy(() => import("@/pages/Stock"));
const Settings = lazy(() => import("@/features/settings").then(m => ({ default: m.Settings })));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Tiers = lazy(() => import("@/features/crm").then(m => ({ default: m.Tiers })));
const TierDetail = lazy(() => import("@/features/crm").then(m => ({ default: m.TierDetail })));
const WorkLibrary = lazy(() => import("@/pages/WorkLibrary"));
const MaterialDetail = lazy(() => import("@/pages/MaterialDetail"));
const LaborDetail = lazy(() => import("@/pages/LaborDetail"));
const WorkDetail = lazy(() => import("@/pages/WorkDetail"));
const Opportunities = lazy(() => import("@/features/crm").then(m => ({ default: m.Opportunities })));
const OpportunityDetail = lazy(() => import("@/features/crm").then(m => ({ default: m.OpportunityDetail })));

// Loading component for lazy routes
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

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
              <Route path="devis" element={
                <Suspense fallback={<PageLoader />}>
                  <DevisNew />
                </Suspense>
              } />
              <Route path="devis/nouveau" element={
                <Suspense fallback={<PageLoader />}>
                  <QuoteEditor />
                </Suspense>
              } />
              <Route path="devis/edit/:id" element={
                <Suspense fallback={<PageLoader />}>
                  <QuoteEditor />
                </Suspense>
              } />
              <Route path="devis/preview/:id" element={
                <Suspense fallback={<PageLoader />}>
                  <QuotePreview />
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
              <Route path="factures/preview/:id" element={
                <Suspense fallback={<PageLoader />}>
                  <InvoicePreview />
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
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}