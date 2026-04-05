import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { TournamentProvider } from "./context/TournamentProvider.jsx";
import HomeRedirect from "./routes/HomeRedirect.jsx";
import TournamentEntry from "./routes/TournamentEntry.jsx";
import LiveHome from "./pages/live/LiveHome.jsx";
import PastResultsPage from "./pages/live/PastResultsPage.jsx";
import LineupPage from "./pages/live/LineupPage.jsx";
import BoosterPage from "./pages/live/BoosterPage.jsx";
import OwnersPage from "./pages/live/OwnersPage.jsx";
import PlayersPage from "./pages/live/PlayersPage.jsx";
import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <TournamentProvider>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          {/* Trailing /* so IPL25’s nested <Routes> in Ipl25Shell can match /t/:id/... */}
          <Route path="/t/:tournamentId/*" element={<TournamentEntry />}>
            <Route index element={<LiveHome />} />
            <Route path="players" element={<PlayersPage />} />
            <Route path="owners" element={<OwnersPage />} />
            <Route
              path="country"
              element={<Navigate to="../lineup" replace />}
            />
            <Route path="lineup" element={<LineupPage />} />
            <Route path="cvc" element={<Navigate to="../booster" replace />} />
            <Route path="booster" element={<BoosterPage />} />
            <Route path="past-results" element={<PastResultsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </TournamentProvider>
    </BrowserRouter>
  );
}
