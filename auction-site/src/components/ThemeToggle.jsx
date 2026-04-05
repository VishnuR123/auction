import { Button, Tooltip } from "antd";
import { useThemeMode } from "../context/useThemeMode.js";
import iconToDark from "../assets/theme/toggle-to-dark.png";
import iconToLight from "../assets/theme/toggle-to-light.png";

export default function ThemeToggle() {
  const { isDark, toggle } = useThemeMode();

  return (
    <Tooltip title={isDark ? "Light mode" : "Dark mode"}>
      <Button
        type="text"
        className="theme-toggle-btn"
        icon={
          <img
            src={isDark ? iconToLight : iconToDark}
            alt=""
            className="theme-toggle-btn__icon"
            width={20}
            height={20}
            decoding="async"
          />
        }
        onClick={toggle}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      />
    </Tooltip>
  );
}
