import { useEffect, useState } from "react";
import {
  Title, Button, Table, Badge, Modal, TextInput, Textarea, Select,
  Group, ActionIcon, Text, Stack,
} from "@mantine/core";
import { IconTrash, IconPlus, IconEye } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { getTemplates, createTemplate, deleteTemplate } from "../services/api";
import type { Template } from "../types";

const CATEGORY_OPTIONS = [
  { value: "it", label: "IT / Güvenlik" },
  { value: "hr", label: "İnsan Kaynakları" },
  { value: "finance", label: "Finans" },
  { value: "general", label: "Genel" },
];

const DEFAULT_TEMPLATE = `<div style="font-family:sans-serif;max-width:600px;margin:auto">
<p>Sayın <strong>{{name}}</strong>,</p>
<p>Lütfen <a href="{{link}}">buraya tıklayın</a>.</p>
</div>`;

export default function Templates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", subject: "", category: "it", html_body: DEFAULT_TEMPLATE,
  });

  const load = () => getTemplates().then(setTemplates);
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try {
      await createTemplate(form);
      notifications.show({ message: "Template oluşturuldu", color: "green" });
      setCreateOpen(false);
      setForm({ name: "", subject: "", category: "it", html_body: DEFAULT_TEMPLATE });
      load();
    } catch (e: any) {
      notifications.show({ message: e.message, color: "red" });
    }
  };

  const handleDelete = async (id: number) => {
    await deleteTemplate(id);
    notifications.show({ message: "Silindi", color: "orange" });
    load();
  };

  return (
    <div>
      <Group justify="space-between" mb="lg">
        <Title order={2}>E-posta Şablonları</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={() => setCreateOpen(true)}>
          Yeni Şablon
        </Button>
      </Group>

      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Ad</Table.Th>
            <Table.Th>Konu</Table.Th>
            <Table.Th>Kategori</Table.Th>
            <Table.Th>Tarih</Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {templates.map((t) => (
            <Table.Tr key={t.id}>
              <Table.Td>{t.name}</Table.Td>
              <Table.Td>{t.subject}</Table.Td>
              <Table.Td>
                <Badge variant="light">{t.category.toUpperCase()}</Badge>
              </Table.Td>
              <Table.Td>{new Date(t.created_at).toLocaleDateString("tr-TR")}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon variant="light" color="blue" onClick={() => setPreviewHtml(t.html_body)}>
                    <IconEye size={16} />
                  </ActionIcon>
                  <ActionIcon variant="light" color="red" onClick={() => handleDelete(t.id)}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {/* Create Modal */}
      <Modal opened={createOpen} onClose={() => setCreateOpen(false)} title="Yeni Şablon" size="xl">
        <Stack>
          <TextInput label="Şablon Adı" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <TextInput label="E-posta Konusu" value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
          <Select label="Kategori" data={CATEGORY_OPTIONS} value={form.category}
            onChange={(v) => setForm({ ...form, category: v || "general" })} />
          <Textarea label="HTML İçerik" value={form.html_body}
            onChange={(e) => setForm({ ...form, html_body: e.target.value })}
            minRows={10} autosize
            description="Değişkenler: {{name}}, {{email}}, {{link}}" />
          <Text size="xs" c="dimmed">
            Önizleme için içeriği kaydedin ve göz simgesine tıklayın.
          </Text>
          <Button onClick={handleCreate}>Oluştur</Button>
        </Stack>
      </Modal>

      {/* Preview Modal */}
      <Modal opened={!!previewHtml} onClose={() => setPreviewHtml(null)}
        title="Önizleme" size="xl">
        <div dangerouslySetInnerHTML={{
          __html: (previewHtml || "")
            .replace(/{{name}}/g, "Ahmet Yılmaz")
            .replace(/{{email}}/g, "ahmet@test.local")
            .replace(/{{link}}/g, "#")
        }} />
      </Modal>
    </div>
  );
}
