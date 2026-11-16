import React, { useCallback, useEffect, useState } from "react";
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Center,
  Group,
  Loader,
  Modal,
  Paper,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { IconAlertCircle, IconSearch, IconTrash, IconUserPlus, IconUsers } from "@tabler/icons-react";
import dayjs from "dayjs";
import api from "../utils/api";

const BASE = "/api/backtest-access";

const errMsg = (err) => err.response?.data?.message || err.message || "Request failed";

// admin session: refresh once on 401, then go to login (keeps the server's error message otherwise)
const call = async (config, retry = true) => {
  try {
    return (await api(config)).data;
  } catch (err) {
    if (err.response?.status === 401 && retry) {
      try {
        await api.post("/api/adminauth/refresh");
        return call(config, false);
      } catch {
        window.location.href = "/auth/login";
      }
    }
    throw err;
  }
};

// --------------------------------------------------
// Manage users of one strategy
// --------------------------------------------------

const ManageUsersModal = ({ strategy, onClose, onChanged }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);

  const loadUsers = useCallback(async () => {
    try {
      setUsers(await call({ method: "get", url: `${BASE}/strategies/${strategy.key}/users` }));
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  }, [strategy.key]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // search by name / email / mobile, 300 ms after typing stops
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return undefined;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        setResults(await call({ method: "get", url: `${BASE}/users/search`, params: { q } }));
      } catch (err) {
        setError(errMsg(err));
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const allow = async (user) => {
    setBusy(user.id);
    setError(null);
    try {
      await call({ method: "post", url: `${BASE}/strategies/${strategy.key}/users`, data: { userIds: [user.id] } });
      await loadUsers();
      onChanged();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(null);
    }
  };

  const remove = async (user) => {
    setBusy(user.id);
    setError(null);
    try {
      await call({ method: "delete", url: `${BASE}/strategies/${strategy.key}/users/${user.id}` });
      await loadUsers();
      onChanged();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(null);
    }
  };

  const hasAccess = new Set(users.map((u) => u.id));

  return (
    <Modal opened onClose={onClose} size="xl" title={<Text fw={700}>Users allowed to backtest {strategy.title}</Text>}>
      <Stack gap="md">
        {error && (
          <Alert color="red" icon={<IconAlertCircle />} withCloseButton onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <TextInput
          label="Add a user"
          placeholder="Search by name, email or mobile number"
          leftSection={<IconSearch size={16} />}
          rightSection={searching ? <Loader size={14} /> : null}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
        />

        {query.trim().length >= 2 && !searching && results.length === 0 && (
          <Text size="sm" c="dimmed">
            No users match “{query.trim()}”.
          </Text>
        )}

        {results.length > 0 && (
          <Paper withBorder radius="md">
            <Table verticalSpacing="xs" fz="sm" highlightOnHover>
              <Table.Tbody>
                {results.map((u) => (
                  <Table.Tr key={u.id}>
                    <Table.Td fw={600}>{u.fullname || "No name"}</Table.Td>
                    <Table.Td>{u.email}</Table.Td>
                    <Table.Td>{u.mobile_number || "-"}</Table.Td>
                    <Table.Td ta="right">
                      {hasAccess.has(u.id) ? (
                        <Badge color="teal" variant="light">
                          Allowed
                        </Badge>
                      ) : (
                        <Button
                          size="xs"
                          leftSection={<IconUserPlus size={14} />}
                          loading={busy === u.id}
                          onClick={() => allow(u)}
                        >
                          Allow
                        </Button>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        )}

        <div>
          <Text fw={600} mb="xs">
            Allowed users ({users.length})
          </Text>
          {loading ? (
            <Center py="md">
              <Loader size="sm" />
            </Center>
          ) : users.length === 0 ? (
            <Text size="sm" c="dimmed">
              Nobody has access yet. Search above to add users.
            </Text>
          ) : (
            <Table.ScrollContainer minWidth={600}>
              <Table verticalSpacing="xs" fz="sm" striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Email</Table.Th>
                    <Table.Th>Mobile</Table.Th>
                    <Table.Th>Allowed on</Table.Th>
                    <Table.Th />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {users.map((u) => (
                    <Table.Tr key={u.id}>
                      <Table.Td fw={600}>{u.fullname || "No name"}</Table.Td>
                      <Table.Td>{u.email}</Table.Td>
                      <Table.Td>{u.mobile_number || "-"}</Table.Td>
                      <Table.Td>{dayjs(u.granted_at).format("DD MMM YYYY")}</Table.Td>
                      <Table.Td ta="right">
                        <Tooltip label="Remove access">
                          <ActionIcon color="red" variant="subtle" loading={busy === u.id} onClick={() => remove(u)}>
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          )}
        </div>
      </Stack>
    </Modal>
  );
};

// --------------------------------------------------
// Strategy list
// --------------------------------------------------

const BacktestAccess = () => {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [managing, setManaging] = useState(null);

  const load = useCallback(async () => {
    try {
      setStrategies(await call({ method: "get", url: `${BASE}/strategies` }));
      setError(null);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleActive = async (s) => {
    setToggling(s.key);
    try {
      await call({ method: "patch", url: `${BASE}/strategies/${s.key}`, data: { is_active: !s.is_active } });
      await load();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        Allow users to backtest a strategy from their own panel. Users run one day at a time on the platform's Dhan data.
        Turning a strategy off hides it from every user without removing their access.
      </Text>

      {error && (
        <Alert color="red" icon={<IconAlertCircle />} withCloseButton onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper withBorder radius="md">
        <Table.ScrollContainer minWidth={760}>
          <Table verticalSpacing="sm" fz="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Strategy</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th ta="center">Available to users</Table.Th>
                <Table.Th ta="right">Users</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {strategies.map((s) => (
                <Table.Tr key={s.key}>
                  <Table.Td>
                    <Text fw={600} size="sm" style={{ wordBreak: "break-word" }}>
                      {s.title}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {s.key}
                    </Text>
                  </Table.Td>
                  <Table.Td maw={420}>
                    <Text size="xs" c="dimmed" lineClamp={3}>
                      {s.description}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Center>
                      <Switch
                        checked={s.is_active}
                        disabled={toggling === s.key}
                        onChange={() => toggleActive(s)}
                        aria-label={`Make ${s.title} available to users`}
                      />
                    </Center>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Button size="xs" variant="light" leftSection={<IconUsers size={14} />} onClick={() => setManaging(s)}>
                      Manage ({s.user_count})
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>

      {managing && <ManageUsersModal strategy={managing} onClose={() => setManaging(null)} onChanged={load} />}
    </Stack>
  );
};

export default BacktestAccess;
