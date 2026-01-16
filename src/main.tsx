import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { FeatureFlagsProvider } from "./contexts/FeatureFlagsContext";
import { AppStateProvider } from "./contexts/AppContext";

createRoot(document.getElementById("root")!).render(
  <FeatureFlagsProvider>
    <AppStateProvider>
      <App />
    </AppStateProvider>
  </FeatureFlagsProvider>
);
