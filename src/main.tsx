import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Configuration d'environnement prête
import { Toaster } from "@/components/ui/toaster";

createRoot(document.getElementById("root")!).render(
  // StrictMode désactivé temporairement pour éviter les doubles appels API en développement
  // <StrictMode>
  <>
    <App />
    <Toaster />
  </>
  // </StrictMode>
);