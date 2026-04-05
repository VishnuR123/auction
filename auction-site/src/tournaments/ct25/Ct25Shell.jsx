import TournamentSwitcher from "../../components/TournamentSwitcher.jsx";
import "../../styles/xp/loadXpChrome.js";
import "./ct25Shell.css";
import {
  CT25_PLAYER_LIST_SCREENSHOT_URL,
  CT25_POINTS_SCREENSHOT_URL,
  CT25_WALLPAPER_URL,
  CT25_START_BUTTON_URL,
} from "./ct25Paths.js";

/**
 * Same XP layout as T20 WC 26: wallpaper + points + player-list screenshots.
 * Assets under public/tournaments/2025-ct/branding/ (see ct25Paths.js).
 */
export default function Ct25Shell() {
  return (
    <div className="ct25-shell-root xp-shell-root">
      <div
        className="ct25-shell-toolbar"
        onClick={(e) => e.stopPropagation()}
      >
        <TournamentSwitcher variant="compact" />
      </div>

      <div className="ct25-shell-body">
        <div className="ct25-shell-desktop">
          <img
            className="ct25-wallpaper"
            src={CT25_WALLPAPER_URL}
            alt=""
            decoding="async"
            draggable={false}
          />
          <div className="ct25-desktop-foreground">
            <div className="window ct25-xp-window ct25-xp-window--points surface">
              <div className="title-bar">
                <div className="title-bar-text">Points Table</div>
                <div className="title-bar-controls">
                  <button type="button" aria-label="Minimize" />
                  <button type="button" aria-label="Maximize" />
                  <button type="button" aria-label="Close" />
                </div>
              </div>
              <div className="window-body ct25-window-body ct25-window-body--points">
                <img
                  className="ct25-points-screenshot"
                  src={CT25_POINTS_SCREENSHOT_URL}
                  alt="Points table"
                  width={424}
                  height={325}
                  decoding="async"
                />
              </div>
            </div>

            <div className="window ct25-xp-window ct25-xp-window--players surface">
              <div className="title-bar">
                <div className="title-bar-text">Player list</div>
                <div className="title-bar-controls">
                  <button type="button" aria-label="Minimize" />
                  <button type="button" aria-label="Maximize" />
                  <button type="button" aria-label="Close" />
                </div>
              </div>
              <div className="window-body ct25-window-body ct25-window-body--players">
                <img
                  className="ct25-player-list-screenshot"
                  src={CT25_PLAYER_LIST_SCREENSHOT_URL}
                  alt="Player list"
                  width={708}
                  height={274}
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="ct25-taskbar" role="presentation">
          <button type="button" className="ct25-taskbar__start">
            <img
              className="ct25-taskbar__start--logo"
              src={CT25_START_BUTTON_URL}
              alt=""
            />
            start
          </button>
        </div>
      </div>
    </div>
  );
}
