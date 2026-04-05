import TournamentSwitcher from "../../components/TournamentSwitcher.jsx";
import "../../styles/xp/loadXpChrome.js";
import "./ipl23Shell.css";
import {
  IPL23_START_BUTTON_URL,
  IPL23_WALLPAPER_URL,
  ipl23PdfEmbedSrc,
} from "./ipl23Paths.js";

/**
 * XP desktop: wallpaper + one window with a PDF (scroll inside the iframe / PDF viewer).
 * Add `ipl23.pdf`, `wallpaper.jpg`, `windows-logo.png` under public/tournaments/2023-ipl/branding/
 */
export default function Ipl23Shell() {
  return (
    <div className="ipl23-shell-root xp-shell-root">
      <div
        className="ipl23-shell-toolbar"
        onClick={(e) => e.stopPropagation()}
      >
        <TournamentSwitcher variant="compact" />
      </div>

      <div className="ipl23-shell-body">
        <div className="ipl23-shell-desktop">
          <img
            className="ipl23-wallpaper"
            src={IPL23_WALLPAPER_URL}
            alt=""
            decoding="async"
            draggable={false}
          />
          <div className="ipl23-desktop-foreground">
            <div className="window ipl23-xp-window surface">
              <div className="title-bar">
                <div className="title-bar-text">IPL 2023 — document</div>
                <div className="title-bar-controls">
                  <button type="button" aria-label="Minimize" />
                  <button type="button" aria-label="Maximize" />
                  <button type="button" aria-label="Close" />
                </div>
              </div>
              <div className="window-body ipl23-window-body--pdf">
                <iframe
                  className="ipl23-pdf-iframe"
                  title="IPL 2023 PDF"
                  src={ipl23PdfEmbedSrc()}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="ipl23-taskbar" role="presentation">
          <button type="button" className="ipl23-taskbar__start">
            <img
              className="ipl23-taskbar__start--logo"
              src={IPL23_START_BUTTON_URL}
              alt=""
            />
            start
          </button>
        </div>
      </div>
    </div>
  );
}
