import postcssPrefixSelector from "postcss-prefix-selector";

/**
 * Third-party WinXP skin (XP.css) ships global selectors: `body`, `h1`, `a`,
 * `::-webkit-scrollbar`, etc. Those must not affect Ant Design or the rest of the app.
 *
 * `postcss-prefix-selector` rewrites every rule in `xp-vendor.css` under `.xp-shell-root`
 * and maps `html` / `body` / `:root` to that class (see plugin README).
 *
 * `@font-face` is unchanged (no selector rules) — fonts register globally; that does not
 * restyle unrelated UI.
 *
 * IMPORTANT: Only `src/styles/xp/xp-vendor.css` is processed. All other CSS is untouched.
 * XP tournament shells must wrap their tree in `className="… xp-shell-root"` and import
 * this file only from those shells (never import `xp-vendor.css` from shared modules).
 *
 * Matching uses substring `includes()` (see postcss-prefix-selector): Vite often appends
 * `?used`, `?inline`, or `?t=…` to the file path. A regex with `$` against `.css` fails
 * in that case, the plugin skips the file entirely, and unprefixed `button` / `a` / etc.
 * leak globally — which breaks Ant Design on other tournament routes.
 */
export default {
  plugins: [
    postcssPrefixSelector({
      prefix: ".xp-shell-root",
      includeFiles: [
        "styles/xp/xp-vendor.css",
        "styles\\xp\\xp-vendor.css",
      ],
    }),
  ],
};
