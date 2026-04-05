/**
 * WinXP chrome (XP.css) for CT25 / IPL23 / T20WC26 shells only.
 * `xp-vendor.css` is scoped to `.xp-shell-root` by PostCSS — import this module
 * only from those shells, and keep the shell root as `className="… xp-shell-root"`.
 * `xpTournamentSwitcherExempt.css` overrides XP’s global `button` rules for the
 * tournament dropdown (trigger / backdrop / menu rows).
 */
import "./xp-vendor.css";
import "./xpTournamentSwitcherExempt.css";
