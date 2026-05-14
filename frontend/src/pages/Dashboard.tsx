import { useEffect, useState } from "react";
import { SimpleGrid, Card, Text, Title, RingProgress, Group, Badge, Skeleton } from "@mantine/core";
import { IconMail, IconUsers, IconLayoutDashboard, IconAlertTriangle } from "@tabler/icons-react";
import { getGlobalStats } from "../services/api";
import type { GlobalStats } from "../types";

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.FC<{ size?: number; color?: string }>;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Group>
        <Icon size={28} color={color} />
        <div>
          <Text size="xs" c="dimmed">{label}</Text>
          <Title order={3}>{value}</Title>
        </div>
      </Group>
    </Card>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGlobalStats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton height={200} />;
  if (!stats) return <Text c="red">Veriler yüklenemedi.</Text>;

  return (
    <div>
      <Title order={2} mb="lg">Genel Bakış</Title>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="xl">
        <StatCard icon={IconLayoutDashboard} label="Toplam Kampanya" value={stats.total_campaigns} color="#4361ee" />
        <StatCard icon={IconUsers} label="Hedef Kullanıcı" value={stats.total_users} color="#06b6d4" />
        <StatCard icon={IconMail} label="Gönderilen E-posta" value={stats.total_sent} color="#10b981" />
        <StatCard icon={IconAlertTriangle} label="Form Dolduran" value={stats.total_submits} color="#ef4444" />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Card shadow="sm" p="lg" radius="md" withBorder>
          <Title order={4} mb="md">Tıklama Oranı</Title>
          <Group>
            <RingProgress
              size={120}
              thickness={12}
              sections={[{ value: stats.click_rate, color: "#f59e0b" }]}
              label={<Text ta="center" fw={700}>{stats.click_rate}%</Text>}
            />
            <div>
              <Text size="sm">Tıklayan: <strong>{stats.total_clicks}</strong></Text>
              <Text size="sm">Toplam: <strong>{stats.total_sent}</strong></Text>
              <Badge color="yellow" mt="xs">E-posta linki tıklandı</Badge>
            </div>
          </Group>
        </Card>

        <Card shadow="sm" p="lg" radius="md" withBorder>
          <Title order={4} mb="md">Form Gönderim Oranı</Title>
          <Group>
            <RingProgress
              size={120}
              thickness={12}
              sections={[{ value: stats.submit_rate, color: "#ef4444" }]}
              label={<Text ta="center" fw={700}>{stats.submit_rate}%</Text>}
            />
            <div>
              <Text size="sm">Form dolduran: <strong>{stats.total_submits}</strong></Text>
              <Text size="sm">Toplam: <strong>{stats.total_sent}</strong></Text>
              <Badge color="red" mt="xs">Kimlik bilgisi girildi</Badge>
            </div>
          </Group>
        </Card>
      </SimpleGrid>
    </div>
  );
}
