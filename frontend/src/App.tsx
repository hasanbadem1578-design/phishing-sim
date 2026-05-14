import { useState } from "react";
import {
  AppShell, NavLink, Title, Group, Text, MantineProvider, createTheme, Button,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import {
  IconLayoutDashboard, IconMail, IconUsers, IconSend, IconChartBar, IconLogout,
} from "@tabler/icons-react";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import Dashboard from "./pages/Dashboard";
import Templates from "./pages/Templates";
import Users from "./pages/Users";
import Campaigns from "./pages/Campaigns";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";
import { isLoggedIn, clearToken } from "./services/auth";

const theme = createTheme({ primaryColor: "indigo" });

type Page = "dashboard" | "templates" | "users" | "campaigns" | "analytics";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { id: "templates", label: "Şablonlar", icon: IconMail },
  { id: "users", label: "Kullanıcılar", icon: IconUsers },
  { id: "campaigns", label: "Kampanyalar", icon: IconSend },
  { id: "analytics", label: "Analitik", icon: IconChartBar },
] as const;

const PAGES: Record<Page, JSX.Element> = {
  dashboard: <Dashboard />,
  templates: <Templates />,
  users: <Users />,
  campaigns: <Campaigns />,
  analytics: <Analytics />,
};

export default function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [page, setPage] = useState<Page>("dashboard");

  if (!loggedIn) {
    return (
      <MantineProvider theme={theme}>
        <Notifications />
        <Login onLogin={() => setLoggedIn(true)} />
      </MantineProvider>
    );
  }

  return (
    <MantineProvider theme={theme}>
      <Notifications />
      <AppShell navbar={{ width: 220, breakpoint: "sm" }} padding="md">
        <AppShell.Navbar p="md">
          <Group mb="xl" gap="xs">
            <Text size="xl">🎣</Text>
            <Title order={4} c="indigo">PhishSim</Title>
          </Group>

          {NAV.map((n) => (
            <NavLink
              key={n.id}
              label={n.label}
              leftSection={<n.icon size={18} />}
              active={page === n.id}
              onClick={() => setPage(n.id)}
              mb={4}
            />
          ))}

          <Button
            variant="subtle"
            color="red"
            leftSection={<IconLogout size={16} />}
            mt="auto"
            onClick={() => { clearToken(); setLoggedIn(false); }}
            fullWidth
          >
            Çıkış
          </Button>
        </AppShell.Navbar>

        <AppShell.Main>{PAGES[page]}</AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}
