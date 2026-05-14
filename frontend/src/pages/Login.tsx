import { useState } from "react";
import { TextInput, PasswordInput, Button, Paper, Title, Text, Center, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { login } from "../services/api";
import { setToken } from "../services/auth";

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { access_token } = await login(username, password);
      setToken(access_token);
      onLogin();
    } catch (err: any) {
      notifications.show({ message: err.message, color: "red" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center h="100vh" style={{ background: "#f8f9fa" }}>
      <Paper shadow="md" p={40} radius="md" w={380}>
        <Stack align="center" mb="xl">
          <Text size="3rem">🎣</Text>
          <Title order={2}>PhishSim</Title>
          <Text size="sm" c="dimmed">Güvenlik Farkındalık Platformu</Text>
        </Stack>
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Kullanıcı Adı"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <PasswordInput
              label="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" fullWidth loading={loading} mt="sm">
              Giriş Yap
            </Button>
          </Stack>
        </form>
        <Text size="xs" c="dimmed" ta="center" mt="md">
          Demo: admin / phishsim2026
        </Text>
      </Paper>
    </Center>
  );
}
