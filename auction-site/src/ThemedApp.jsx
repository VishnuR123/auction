import { App as AntdApp, ConfigProvider, theme } from "antd";
import App from "./App.jsx";
import { useLiveTournamentShell } from "./context/LiveTournamentShellContext.jsx";
import { useThemeMode } from "./context/useThemeMode.js";

const FONT =
  'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export default function ThemedApp() {
  const { isDark } = useThemeMode();
  const { shellMounted } = useLiveTournamentShell();
  const useAntdDark = isDark && shellMounted;
  return (
    <ConfigProvider
      theme={{
        algorithm: useAntdDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          fontFamily: FONT,
          borderRadius: 8,
        },
      }}
    >
      <AntdApp>
        <App />
      </AntdApp>
    </ConfigProvider>
  );
}
