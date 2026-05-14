import { useEffect, useState } from "react";
import {
  Modal, Title, SimpleGrid, Card, Text, Badge, Table, Group, RingProgress,
  Skeleton, Tabs,
} from "@mantine/core";
import { getCampaignStats } from "../services/api";
import type { CampaignStats } from "../types";

const RISK_COLOR: Record<string, string> = {
  safe: "green", risky: "yellow", high_risk: "red",
};

export default function CampaignReport({
  campaignId,
  onClose,
}: {
  campaignId: number;
  onClose: () => void;
}) {
  const [stats, setStats] = useState<CampaignStats | null>(null);

  useEffect(() => {
    getCampaignStats(campaignId).then(setStats);
  }, [campaignId]);

  return (
    <Modal
      opened
      onClose={onClose}
      title={stats ? `Rapor: ${stats.campaign_name}` : "Rapor Yükleniyor..."}
      size="xl"
    >
      {!stats ? (
        <Skeleton height={200} />
      ) : (
        <Tabs defaultValue="overview">
          <Tabs.List mb="md">
            <Tabs.Tab value="overview">Genel Bakış</Tabs.Tab>
            <Tabs.Tab value="users">Kullanıcılar</Tabs.Tab>
            <Tabs.Tab value="events">Olaylar</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview">
            <SimpleGrid cols={3} mb="lg">
              <Card withBorder p="md" ta="center">
                <Text size="xl" fw={700}>{stats.total_targets}</Text>
                <Text size="xs" c="dimmed">Toplam Hedef</Text>
              </Card>
              <Card withBorder p="md" ta="center">
                <Text size="xl" fw={700} c="yellow">{stats.click_count}</Text>
                <Text size="xs" c="dimmed">Tıklayan (%{stats.click_rate})</Text>
              </Card>
              <Card withBorder p="md" ta="center">
                <Text size="xl" fw={700} c="red">{stats.submit_count}</Text>
                <Text size="xs" c="dimmed">Form Dolduran (%{stats.submit_rate})</Text>
              </Card>
            </SimpleGrid>
            <Group justify="center" gap="xl">
              <div style={{ textAlign: "center" }}>
                <RingProgress size={140} thickness={14}
                  sections={[
                    { value: 100 - stats.click_rate - stats.submit_rate, color: "green" },
                    { value: stats.click_rate, color: "yellow" },
                    { value: stats.submit_rate, color: "red" },
                  ]}
                  label={<Text ta="center" fw={700} size="sm">Risk Dağılımı</Text>}
                />
                <Group gap="xs" justify="center" mt="xs">
                  <Badge color="green">Güvenli</Badge>
                  <Badge color="yellow">Riskli</Badge>
                  <Badge color="red">Yüksek Risk</Badge>
                </Group>
              </div>
            </Group>
          </Tabs.Panel>

          <Tabs.Panel value="users">
            {(["safe_users", "risky_users", "high_risk_users"] as const).map((key) => {
              const riskKey = key.replace("_users", "") as "safe" | "risky" | "high_risk";
              const label = { safe: "Güvenli", risky: "Riskli", high_risk: "Yüksek Risk" }[riskKey];
              return (
                <div key={key} style={{ marginBottom: 16 }}>
                  <Badge color={RISK_COLOR[riskKey]} mb="xs">{label} ({stats[key].length})</Badge>
                  {stats[key].map((u) => (
                    <Text key={u.id} size="sm" px="xs">{u.name} — {u.email}</Text>
                  ))}
                </div>
              );
            })}
          </Tabs.Panel>

          <Tabs.Panel value="events">
            <Table striped withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Kullanıcı</Table.Th>
                  <Table.Th>Olay</Table.Th>
                  <Table.Th>IP</Table.Th>
                  <Table.Th>Zaman</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {stats.events.map((e) => (
                  <Table.Tr key={e.id}>
                    <Table.Td>{e.user_name}</Table.Td>
                    <Table.Td>
                      <Badge color={e.event_type === "submit" ? "red" : e.event_type === "click" ? "yellow" : "gray"}>
                        {e.event_type}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{e.ip_address}</Table.Td>
                    <Table.Td>{new Date(e.created_at).toLocaleString("tr-TR")}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Tabs.Panel>
        </Tabs>
      )}
    </Modal>
  );
}
