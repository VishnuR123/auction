import React from "react";
import { Link } from "react-router-dom";
import myicon from "./assets/IPL.svg?url";
import { IPL25_BASE } from "./ipl25Paths.js";

/** Inline SVGs — avoids @mui/icons-material default-export interop issues with React 19 + Vite. */
function NavIcon({ children }) {
  return (
    <svg
      className="sidebar-nav__icon"
      width={23}
      height={23}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function Sidebar({ isOpen, toggleSidebar }) {
  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <nav>
        <div className="nav-header">
          <img src={myicon} alt="" className="avatar" />
          <br />
          <br />
          <h2 className="nav-title">POINTS DASHBOARD</h2>
        </div>
        <ul>
          <li onClick={toggleSidebar}>
            <NavIcon>
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </NavIcon>
            <Link to={IPL25_BASE} className="custom-link">
              Home
            </Link>
          </li>
          <li onClick={toggleSidebar}>
            <NavIcon>
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4" />
            </NavIcon>
            <Link to={`${IPL25_BASE}/owners`} className="custom-link">
              Owner Page
            </Link>
          </li>
          <li onClick={toggleSidebar}>
            <NavIcon>
              <path d="M15.05 12.81 6.56 4.32a.9959.9959 0 0 0-1.41 0L2.32 7.15c-.39.39-.39 1.02 0 1.41l8.49 8.49c.39.39 1.02.39 1.41 0l2.83-2.83c.39-.39.39-1.02 0-1.41m-.7088 4.9462 1.4142-1.4142 4.2426 4.2426-1.4142 1.4142z" />
              <circle cx="18.5" cy="5.5" r="3.5" />
            </NavIcon>
            <Link to={`${IPL25_BASE}/players`} className="custom-link">
              Player Page
            </Link>
          </li>
          <li onClick={toggleSidebar}>
            <NavIcon>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39" />
            </NavIcon>
            <Link to={`${IPL25_BASE}/country`} className="custom-link">
              Team Lineup
            </Link>
          </li>
          <li onClick={toggleSidebar}>
            <NavIcon>
              <path d="m19 9 1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25z" />
            </NavIcon>
            <Link to={`${IPL25_BASE}/cvc`} className="custom-link">
              C/VC List
            </Link>
          </li>
          <li onClick={toggleSidebar}>
            <NavIcon>
              <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9m-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8z" />
            </NavIcon>
            <Link to={`${IPL25_BASE}/past-results`} className="custom-link">
              Past Results
            </Link>
          </li>
          <li onClick={toggleSidebar}>
            <NavIcon>
              <path d="M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1-2.73 2.71-2.73 7.08 0 9.79s7.15 2.71 9.88 0C18.32 15.65 19 14.08 19 12.1h2c0 1.98-.88 4.55-2.64 6.29-3.51 3.48-9.21 3.48-12.72 0-3.5-3.47-3.53-9.11-.02-12.58s9.14-3.47 12.65 0L21 3zM12.5 8v4.25l3.5 2.08-.72 1.21L11 13V8z" />
            </NavIcon>
            <Link to={`${IPL25_BASE}/predictions`} className="custom-link">
              Predictions
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
