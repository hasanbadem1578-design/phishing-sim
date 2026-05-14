import { useEffect, useState } from "react";
import {
  Title, Button, Table, Badge, Modal, TextInput, Textarea, Select,
  MultiSelect, Group, ActionIcon, Text, Stack, Progress,
} from "@mantine/core";
import { IconPlayerPlay, IconTrash, IconPlus, IconChartBar } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { getCampaigns, createCampaign, startCampaign, deleteCampaign, getTemplates, getUsers } from "../services/api";
import type { Campaign, Template, TargetUser } from "../types";
import CampaignReport from "../components/CampaignReport";

const STATUS_COLOR: Record<string, string> = {
  draft: "gray", active: "blue", completed: "green",
};
const STATUS_LABEL: Record<string, string> = {
  draft: "Taslak", active: "Aktif", completed: "Tamamlandı",
};

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [users, setUsers] = useState<TargetUser[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [reportId, setReportId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", template_id: "", user_ids: [] as string[],
  });

  const load = () => getCampaigns().then(setCampaigns);
  useEffect(() => {
    load();
    getTemplates().then(setTemplates);
    getUsers().then(setUsers);
  }, []);

  const handleCreate = async () => {
    if (!form.template_id) return;
    try {
      await createCampaign({
        name: form.name,
        description: form.description,
        template_id: Number(form.template_id),
        user_ids: form.user_ids.map(Number),
      });
      notifications.show({ message: "Kampanya oluşturuldu", color: "green" });
      setCreateOpen(false);
      setForm({ name: "", description: "", template_id: "", user_ids: [] });
      load();
    } catch (e: any) {
      notifications.show({ message: e.message, color: "red" });
    }
  };

  const handleStart = async (id: number) => {
    try {
      const res = await startCampaign(id);
      notifications.show({ message: `${res.sent} e-posta gönderildi`, color: "teal" });
      load();
    } catch (e: any) {
      notifications.show({ message: e.message, color: "red" });
    }
  };

  return (
    <div>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Kampanyalar</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={() => setCreateOpen(true)}>
          Yeni Kampanya
        </Button>
      </Group>

      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Ad</Table.Th>
            <Table.Th>Şablon</Table.Th>
            <Table.Th>Durum</Table.Th>
            <Table.Th>Hedef</Table.Th>
            <Table.Th>Tıklama</Table.Th>
            <Table.Th>Form</Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {campaigns.map((c) => (
            <Table.Tr key={c.id}>
              <Table.Td>{c.name}</Table.Td>
              <Table.Td><Text size="sm" c="dimmed">{c.template_name}</Text></Table.Td>
              <Table.Td>
                <Badge color={STATUS_COLOR[c.status]}>{STATUS_LABEL[c.status]}</Badge>
              </Table.Td>
              <Table.Td>{c.target_count}</Table.Td>
              <Table.Td>
                <Group gap={4}>
                  <Text size="sm">{c.click_rate}%</Text>
                  <Progress value={c.click_rate} color="yellow" size="sm" w={60} />
                </Group>
              </Table.Td>
              <Table.Td>
                <Group gap={4}>
                  <Text size="sm">{c.submit_rate}%</Text>
                  <Progress value={c.submit_rate} color="red" size="sm" w={60} />
                </Group>
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  {c.status === "draft" && (
                    <ActionIcon variant="light" color="teal" onClick={() => handleStart(c.id)}>
                      <IconPlayerPlay size={16} />
                    </ActionIcon>
                  )}
                  <ActionIcon variant="light" color="blue" onClick={() => setReportId(c.id)}>
                    <IconChartBar size={16} />
                  </ActionIcon>
                  <ActionIcon variant="light" color="red"
                    onClick={() => deleteCampaign(c.id).then(load)}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {/* Create Modal */}
      <Modal opened={createOpen} onClose={() => setCreateOpen(false)} title="Yeni Kampanya" size="lg">
        <Stack>
          <TextInput label="Kampanya Adı" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Textarea label="Açıklama" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Select label="E-posta Şablonu" required
            data={templates.map((t) => ({ value: String(t.id), label: t.name }))}
            value={form.template_id}
            onChange={(v) => setForm({ ...form, template_id: v || "" })} />
          <MultiSelect label="Hedef Kullanıcılar"
            data={users.map((u) => ({ value: String(u.id), label: `${u.name} (${u.email})` }))}
            value={form.user_ids}
            onChange={(v) => setForm({ ...form, user_ids: v })} />
          <Button onClick={handleCreate}>Oluştur</Button>
        </Stack>
      </Modal>

      {/* Report Modal */}
      {reportId && (
        <CampaignReport campaignId={reportId} onClose={() => setReportId(null)} />
      )}
    </div>
  );
}
