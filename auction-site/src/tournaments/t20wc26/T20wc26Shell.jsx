import TournamentSwitcher from "../../components/TournamentSwitcher.jsx";
import "../../styles/xp/loadXpChrome.js";
import "./t20wc26Shell.css";
import {
  T20WC26_PLAYER_LIST_SCREENSHOT_URL,
  T20WC26_POINTS_SCREENSHOT_URL,
  T20WC26_WALLPAPER_URL,
  T20WC26_START_BUTTON_URL,
} from "./t20wc26Paths.js";

/**
 * XP-style desktop: wallpaper + two framed screenshots (no API / JSON / Excel).
 * Assets under public/tournaments/2026-t20wc/branding/ (see t20wc26Paths.js).
 */
export default function T20wc26Shell() {
  return (
    <div className="t20wc26-shell-root xp-shell-root">
      <div
        className="t20wc26-shell-toolbar"
        onClick={(e) => e.stopPropagation()}
      >
        <TournamentSwitcher variant="compact" />
      </div>

      <div className="t20wc26-shell-body">
        <div className="t20wc26-shell-desktop">
          <img
            className="t20wc26-wallpaper"
            src={T20WC26_WALLPAPER_URL}
            alt=""
            decoding="async"
            draggable={false}
          />
          <div className="t20wc26-desktop-foreground">
            <div className="window t20wc26-xp-window t20wc26-xp-window--points surface">
              <div className="title-bar">
                <div className="title-bar-text">Points Table</div>
                <div className="title-bar-controls">
                  <button type="button" aria-label="Minimize" />
                  <button type="button" aria-label="Maximize" />
                  <button type="button" aria-label="Close" />
                </div>
              </div>
              <div className="window-body t20wc26-window-body t20wc26-window-body--points">
                <img
                  className="t20wc26-points-screenshot"
                  src={T20WC26_POINTS_SCREENSHOT_URL}
                  alt="Points table"
                  width={338}
                  height={257}
                  decoding="async"
                />
              </div>
            </div>

            <div className="window t20wc26-xp-window t20wc26-xp-window--players surface">
              <div className="title-bar">
                <div className="title-bar-text">Player list</div>
                <div className="title-bar-controls">
                  <button type="button" aria-label="Minimize" />
                  <button type="button" aria-label="Maximize" />
                  <button type="button" aria-label="Close" />
                </div>
              </div>
              <div className="window-body t20wc26-window-body t20wc26-window-body--players">
                <img
                  className="t20wc26-player-list-screenshot"
                  src={T20WC26_PLAYER_LIST_SCREENSHOT_URL}
                  alt="Player list"
                  width={708}
                  height={274}
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="taskbar" role="presentation">
          <button type="button" className="taskbar__start">
            <img
              className="taskbar__start--logo"
              src={T20WC26_START_BUTTON_URL}
              alt=""
            />
            start
          </button>
        </div>
      </div>
    </div>
  );
}
