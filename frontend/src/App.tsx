import { useState } from "react";
import {
  AppShell, NavLink, Title, Group, Text, MantineProvider, createTheme,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import {
  IconLayoutDashboard, IconMail, IconUsers, IconSend,
} from "@tabler/icons-react";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import Dashboard from "./pages/Dashboard";
import Templates from "./pages/Templates";
import Users from "./pages/Users";
import Campaigns from "./pages/Campaigns";

const theme = createTheme({ primaryColor: "indigo" });

type Page = "dashboard" | "templates" | "users" | "campaigns";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { id: "templates", label: "Şablonlar", icon: IconMail },
  { id: "users", label: "Kullanıcılar", icon: IconUsers },
  { id: "campaigns", label: "Kampanyalar", icon: IconSend },
] as const;

const PAGES: Record<Page, JSX.Element> = {
  dashboard: <Dashboard />,
  templates: <Templates />,
  users: <Users />,
  campaigns: <Campaigns />,
};

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");

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
          <Text size="xs" c="dimmed" mt="auto" pt="xl">
            Güvenlik Farkındalık Platformu
          </Text>
        </AppShell.Navbar>

        <AppShell.Main>{PAGES[page]}</AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}
