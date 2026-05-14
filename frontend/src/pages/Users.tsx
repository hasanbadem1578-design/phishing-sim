import { useRef, useEffect, useState } from "react";
import {
  Title, Button, Table, Modal, TextInput, Group, ActionIcon, Stack, Badge, Text,
} from "@mantine/core";
import { IconTrash, IconPlus, IconUpload } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { getUsers, createUser, deleteUser, importUsersCSV } from "../services/api";
import type { TargetUser } from "../types";

export default function Users() {
  const [users, setUsers] = useState<TargetUser[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", department: "" });
  const csvRef = useRef<HTMLInputElement>(null);

  const load = () => getUsers().then(setUsers);
  useEffect(() => { load(); }, []);

  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await importUsersCSV(file);
      notifications.show({ message: `${res.added} kullanıcı eklendi, ${res.skipped} atlandı`, color: "teal" });
      load();
    } catch (err: any) {
      notifications.show({ message: err.message, color: "red" });
    }
    e.target.value = "";
  };

  const handleCreate = async () => {
    try {
      await createUser(form);
      notifications.show({ message: "Kullanıcı eklendi", color: "green" });
      setOpen(false);
      setForm({ name: "", email: "", department: "" });
      load();
    } catch (e: any) {
      notifications.show({ message: e.message, color: "red" });
    }
  };

  return (
    <div>
      <input ref={csvRef} type="file" accept=".csv" onChange={handleCSV} style={{ display: "none" }} />
      <Group justify="space-between" mb="lg">
        <Title order={2}>Hedef Kullanıcılar</Title>
        <Group>
          <Button variant="light" leftSection={<IconUpload size={16} />} onClick={() => csvRef.current?.click()}>
            CSV İçe Aktar
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={() => setOpen(true)}>
            Kullanıcı Ekle
          </Button>
        </Group>
      </Group>
      <Text size="xs" c="dimmed" mb="md">CSV formatı: name, email, department (başlık satırı gerekli)</Text>

      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Ad Soyad</Table.Th>
            <Table.Th>E-posta</Table.Th>
            <Table.Th>Departman</Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {users.map((u) => (
            <Table.Tr key={u.id}>
              <Table.Td>{u.name}</Table.Td>
              <Table.Td>{u.email}</Table.Td>
              <Table.Td>
                {u.department && <Badge variant="outline">{u.department}</Badge>}
              </Table.Td>
              <Table.Td>
                <ActionIcon variant="light" color="red"
                  onClick={() => deleteUser(u.id).then(load)}>
                  <IconTrash size={16} />
                </ActionIcon>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal opened={open} onClose={() => setOpen(false)} title="Yeni Kullanıcı">
        <Stack>
          <TextInput label="Ad Soyad" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <TextInput label="E-posta" type="email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <TextInput label="Departman" value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })} />
          <Button onClick={handleCreate}>Ekle</Button>
        </Stack>
      </Modal>
    </div>
  );
}
