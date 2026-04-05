import React from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import { useState } from "react";

import Sidebar from "./Sidebar";
import HomePage from "./components/HomePage/HomePage";
import PlayerPage from "./components/PlayerPage/PlayerPage";
import OwnerPage from "./components/OwnerPage/OwnerPage";
import CountryPage from "./components/CountryPage/CountryPage";
import CVCPage from "./components/CVCPage/CVCPage";
import PastResults from "./components/PastResults/PastResults";
import Predictions from "./components/PredictionPage/Predictions";
import TournamentSwitcher from "../../components/TournamentSwitcher.jsx";

export default function Ipl25Shell({ players, ownerPoints }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const bodyToggleSidebar = () => {
    if (sidebarOpen === true) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="App">
      <button type="button" className="menu-button" onClick={toggleSidebar}>
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 39, color: "#10044a" }}
        >
          menu
        </span>
      </button>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div
        onClick={bodyToggleSidebar}
        className={`content ${sidebarOpen ? "sidebar-open" : ""}`}
      >
        <div
          className="ipl25-archive-toolbar"
          onClick={(e) => e.stopPropagation()}
        >
          <TournamentSwitcher variant="compact" />
        </div>
        {/*
          Descendant <Routes> (RR v7) matches only the pathname *after* the parent
          /t/:tournamentId/* match — e.g. /owners not /t/2025-ipl/owners.
        */}
        <div className="ipl25-page-body">
        <Routes>
          <Route
            index
            element={<HomePage players={players} ownerPoints={ownerPoints} />}
          />
          <Route
            path="players"
            element={<PlayerPage players={players} ownerPoints={ownerPoints} />}
          />
          <Route
            path="owners"
            element={<OwnerPage players={players} ownerPoints={ownerPoints} />}
          />
          <Route
            path="country"
            element={
              <CountryPage players={players} ownerPoints={ownerPoints} />
            }
          />
          <Route
            path="cvc"
            element={<CVCPage players={players} ownerPoints={ownerPoints} />}
          />
          <Route path="past-results" element={<PastResults />} />
          <Route path="predictions" element={<Predictions />} />
        </Routes>
        </div>
      </div>
    </div>
  );
}
