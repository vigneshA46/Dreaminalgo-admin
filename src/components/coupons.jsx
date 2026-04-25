import { useEffect, useState } from "react";
import {
  Container,
  Title,
  Card,
  TextInput,
  NumberInput,
  Button,
  Table,
  Group,
  Text,
  Badge,
  ActionIcon,
  Stack,
  Loader,
} from "@mantine/core";
import { IconTrash, IconRefresh } from "@tabler/icons-react";
import { apiRequest } from "./utils/api";
import { DateInput } from "@mantine/dates";
import dayjs from "dayjs";

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // form state
  const [form, setForm] = useState({
    code: "",
    free_tokens: "",
    max_uses: "",
    expires_at: "",
  });

  // 🔄 Fetch Coupons
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("GET", "/api/coupons");
      setCoupons(res.coupons || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // ➕ Create Coupon
  const handleCreate = async () => {
    if (!form.code || !form.free_tokens) return;

    try {
      setCreating(true);

      await apiRequest("POST", "/api/coupons", {
  ...form,
  free_tokens: Number(form.free_tokens),
  max_uses: form.max_uses ? Number(form.max_uses) : undefined,
  expires_at: form.expires_at
    ? dayjs(form.expires_at).toISOString()
    : null,
});

      setForm({
        code: "",
        free_tokens: "",
        max_uses: "",
        expires_at: "",
      });

      fetchCoupons();
    } catch (err) {
      console.log(err);
    } finally {
      setCreating(false);
    }
  };

  // 🔁 Toggle Coupon
  const handleToggle = async (id) => {
    try {
      await apiRequest("PATCH", `/api/coupons/${id}/toggle`);
      fetchCoupons();
    } catch (err) {
      console.log(err);
    }
  };

  // ❌ Delete Coupon
  const handleDelete = async (id) => {
    try {
      await apiRequest("DELETE", `/api/coupons/${id}`);
      fetchCoupons();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Container size="lg" py="xl">
      <Title mb="lg">Coupons Management</Title>

      {/* CREATE FORM */}
      <Card shadow="sm" radius="lg" p="lg" mb="xl">
        <Title order={4} mb="md">
          Create Coupon
        </Title>

        <Stack>
          <TextInput
            label="Coupon Code"
            placeholder="FREE10"
            value={form.code}
            onChange={(e) =>
              setForm({ ...form, code: e.target.value })
            }
          />

          <NumberInput
            label="Free Tokens"
            placeholder="10"
            value={form.free_tokens}
            onChange={(val) =>
              setForm({ ...form, free_tokens: val })
            }
          />

          <NumberInput
            label="Max Uses"
            placeholder="100"
            value={form.max_uses}
            onChange={(val) =>
              setForm({ ...form, max_uses: val })
            }
          />

          <DateInput
            label="Expiry Date"
            placeholder="Select expiry date"
            value={form.expires_at}
            onChange={(date) =>
                setForm({ ...form, expires_at: date })
            }
            minDate={new Date()}
            />

          <Button bg={"#000"} loading={creating} onClick={handleCreate}>
            Create Coupon
          </Button>
        </Stack>
      </Card>

      {/* LIST */}
      <Card shadow="sm" radius="lg" p="lg">
        <Group justify="space-between" mb="md">
          <Title order={4}>All Coupons</Title>
          <ActionIcon onClick={fetchCoupons} variant="light">
            <IconRefresh size={18} />
          </ActionIcon>
        </Group>

        {loading ? (
          <Loader />
        ) : (
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th>Code</th>
                <th>Tokens</th>
                <th>Used</th>
                <th>Max</th>
                <th>Status</th>
                <th>Expiry</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <Text align="center">No coupons found</Text>
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id}>
                    <td>{c.code}</td>
                    <td>{c.free_tokens}</td>
                    <td>{c.used_count}</td>
                    <td>{c.max_uses}</td>

                    <td>
                      <Badge
                        color={c.is_active ? "green" : "red"}
                      >
                        {c.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>

                    <td>
                      {c.expires_at
                        ? new Date(c.expires_at).toLocaleDateString()
                        : "—"}
                    </td>

                    <td>
                      <Group gap="xs">
                        <Button
                          size="xs"
                          variant="light"
                          onClick={() => handleToggle(c.id)}
                        >
                          Toggle
                        </Button>

                        <ActionIcon
                          color="red"
                          onClick={() => handleDelete(c.id)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </Card>
    </Container>
  );
};

export default Coupons;