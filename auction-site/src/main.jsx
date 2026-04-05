import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ThemedApp from "./ThemedApp.jsx";
import { ThemeModeProvider } from "./context/ThemeModeProvider.jsx";
import { LiveTournamentShellProvider } from "./context/LiveTournamentShellContext.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeModeProvider>
      <LiveTournamentShellProvider>
        <ThemedApp />
      </LiveTournamentShellProvider>
    </ThemeModeProvider>
  </StrictMode>
);
