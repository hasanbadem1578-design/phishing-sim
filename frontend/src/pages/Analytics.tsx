import { useEffect, useState } from "react";
import { Title, SimpleGrid, Card, Text, Skeleton, Badge, Table, Progress } from "@mantine/core";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { getDepartmentStats, getCampaignsOverview } from "../services/api";
import type { DepartmentStat, CampaignOverview } from "../types";

export default function Analytics() {
  const [deptStats, setDeptStats] = useState<DepartmentStat[]>([]);
  const [overview, setOverview] = useState<CampaignOverview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDepartmentStats(), getCampaignsOverview()])
      .then(([d, o]) => { setDeptStats(d); setOverview(o); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton height={400} />;

  return (
    <div>
      <Title order={2} mb="lg">Analitik</Title>

      <SimpleGrid cols={1} mb="xl">
        {/* Campaign comparison bar chart */}
        <Card shadow="sm" p="lg" radius="md" withBorder>
          <Title order={4} mb="md">Kampanya Karşılaştırması</Title>
          {overview.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              Henüz tamamlanmış kampanya yok. Bir kampanya başlatın.
            </Text>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={overview} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis unit="%" domain={[0, 100]} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Legend />
                <Bar dataKey="click_rate" name="Tıklama %" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="submit_rate" name="Form Doldurma %" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </SimpleGrid>

      {/* Department analysis */}
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Title order={4} mb="md">Departman Risk Analizi</Title>
        {deptStats.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            Veri yok — kampanya başlatıldıktan sonra departman verileri burada görünür.
          </Text>
        ) : (
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Departman</Table.Th>
                <Table.Th>Gönderilen</Table.Th>
                <Table.Th>Tıklayan</Table.Th>
                <Table.Th>Tıklama Oranı</Table.Th>
                <Table.Th>Form Dolduran</Table.Th>
                <Table.Th>Risk</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {deptStats.map((d) => {
                const risk = d.submit_rate >= 30 ? "red" : d.submit_rate >= 10 ? "yellow" : "green";
                const riskLabel = d.submit_rate >= 30 ? "Yüksek" : d.submit_rate >= 10 ? "Orta" : "Düşük";
                return (
                  <Table.Tr key={d.department}>
                    <Table.Td fw={500}>{d.department}</Table.Td>
                    <Table.Td>{d.sent}</Table.Td>
                    <Table.Td>{d.click_count}</Table.Td>
                    <Table.Td>
                      <Progress value={d.click_rate} color="yellow" size="sm" w={80} />
                      <Text size="xs">{d.click_rate}%</Text>
                    </Table.Td>
                    <Table.Td>{d.submit_count}</Table.Td>
                    <Table.Td>
                      <Badge color={risk}>{riskLabel} ({d.submit_rate}%)</Badge>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
