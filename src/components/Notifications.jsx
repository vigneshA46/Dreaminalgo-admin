import {
  Button,
  Card,
  Group,
  Text,
  TextInput,
  Textarea,
  Select,
  Stack,
  Grid,
  Badge,
  ActionIcon,
  NumberInput,
  Loader,
} from "@mantine/core";
import { IconTrash, IconPower } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { apiRequest } from "./utils/api";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [days, setDays] = useState(7);

  // -----------------------------
  // FETCH ALL
  // -----------------------------
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("GET", "/api/notifications/admin");
      setNotifications(res.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // -----------------------------
  // CREATE
  // -----------------------------
  const handleCreate = async () => {
    if (!title || !message) return;

    try {
      await apiRequest("POST", "/api/notifications", {
        title,
        message,
        type,
        expires_in_days: days,
      });

      // reset
      setTitle("");
      setMessage("");
      setType("info");
      setDays(7);

      fetchNotifications();
    } catch (err) {
      console.log(err);
    }
  };

  // -----------------------------
  // TOGGLE
  // -----------------------------
  const handleToggle = async (id) => {
    try {
      await apiRequest("PATCH", `/api/notifications/${id}/toggle`);
      fetchNotifications();
    } catch (err) {
      console.log(err);
    }
  };

  // -----------------------------
  // DELETE
  // -----------------------------
  const handleDelete = async (id) => {
    try {
      await apiRequest("DELETE", `/api/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      console.log(err);
    }
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <Stack p="md">
      {/* HEADER */}
      <Text size="xl" fw={700}>
        Notifications
      </Text>

      {/* CREATE FORM */}
      <Card shadow="sm" radius="md" p="lg">
        <Stack>
          <Text fw={600}>Create Notification</Text>

          <TextInput
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            placeholder="Message"
            minRows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Type"
                value={type}
                onChange={setType}
                data={[
                  { value: "info", label: "Info" },
                  { value: "success", label: "Success" },
                  { value: "warning", label: "Warning" },
                  { value: "error", label: "Error" },
                ]}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <NumberInput
                label="Expires in (days)"
                value={days}
                onChange={setDays}
                min={1}
              />
            </Grid.Col>
          </Grid>

          <Button onClick={handleCreate}>Create</Button>
        </Stack>
      </Card>

      {/* LIST */}
      <Card shadow="sm" radius="md" p="lg">
        <Text fw={600} mb="md">
          All Notifications
        </Text>

        {loading ? (
          <Loader />
        ) : notifications.length === 0 ? (
          <Text size="sm" c="dimmed">
            No notifications found
          </Text>
        ) : (
          <Stack>
            {notifications.map((n) => (
              <Card key={n.id} withBorder radius="md" p="md">
                <Group justify="space-between" align="flex-start">
                  <div style={{ flex: 1 }}>
                    <Group mb={5}>
                      <Text fw={600}>{n.title}</Text>

                      <Badge
                        color={
                          n.type === "success"
                            ? "green"
                            : n.type === "warning"
                            ? "yellow"
                            : n.type === "error"
                            ? "red"
                            : "blue"
                        }
                      >
                        {n.type}
                      </Badge>

                      <Badge color={n.is_active ? "green" : "gray"}>
                        {n.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </Group>

                    <Text size="sm" c="dimmed">
                      {n.message}
                    </Text>

                    <Text size="xs" mt={5} c="dimmed">
                      Expires: {new Date(n.expires_at).toLocaleString()}
                    </Text>
                  </div>

                  <Group>
                    <ActionIcon
                      color="blue"
                      variant="light"
                      onClick={() => handleToggle(n.id)}
                    >
                      <IconPower size={16} />
                    </ActionIcon>

                    <ActionIcon
                      color="red"
                      variant="light"
                      onClick={() => handleDelete(n.id)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Card>
            ))}
          </Stack>
        )}
      </Card>
    </Stack>
  );
};

export default Notifications;