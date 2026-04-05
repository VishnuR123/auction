import { Layout, Menu } from "antd";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import {
  CalendarOutlined,
  DatabaseOutlined,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import UpdateMatchPage from "./pages/UpdateMatchPage.jsx";
import TournamentsPage from "./pages/TournamentsPage.jsx";
import OwnersPage from "./pages/OwnersPage.jsx";
import PlayersPage from "./pages/PlayersPage.jsx";
import MatchdaysPage from "./pages/MatchdaysPage.jsx";

const { Sider, Content } = Layout;

function Shell() {
  const loc = useLocation();
  const selected = [loc.pathname];

  return (
    <Layout style={{ minHeight: "100vh", background: "var(--ant-color-bg-layout)" }}>
      <Sider breakpoint="lg" collapsedWidth="0" theme="dark" width={240}>
        <div className="admin-sider-brand">
          <div className="admin-sider-brand__mark" aria-hidden>
            <TrophyOutlined />
          </div>
          <div className="admin-sider-brand__text">
            <span className="admin-sider-brand__title">Fantasy admin</span>
            <span className="admin-sider-brand__subtitle">Scoring & data</span>
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selected}
          items={[
            {
              key: "/match",
              icon: <CalendarOutlined />,
              label: <Link to="/match">Update match</Link>,
            },
            {
              key: "/data/tournaments",
              icon: <TrophyOutlined />,
              label: <Link to="/data/tournaments">Tournaments</Link>,
            },
            {
              key: "/data/owners",
              icon: <UserOutlined />,
              label: <Link to="/data/owners">Owners</Link>,
            },
            {
              key: "/data/players",
              icon: <UserOutlined />,
              label: <Link to="/data/players">Players</Link>,
            },
            {
              key: "/data/matchdays",
              icon: <DatabaseOutlined />,
              label: <Link to="/data/matchdays">Matchdays</Link>,
            },
          ]}
        />
      </Sider>
      <Layout style={{ background: "var(--ant-color-bg-layout)" }}>
        <Content style={{ margin: 24, minWidth: 0 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/match" replace />} />
            <Route path="/match" element={<UpdateMatchPage />} />
            <Route path="/data/tournaments" element={<TournamentsPage />} />
            <Route path="/data/owners" element={<OwnersPage />} />
            <Route path="/data/players" element={<PlayersPage />} />
            <Route path="/data/matchdays" element={<MatchdaysPage />} />
            <Route path="*" element={<Navigate to="/match" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
