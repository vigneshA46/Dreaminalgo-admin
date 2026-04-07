import {
  Box,
  Button,
  Group,
  Text,
  Card,
  Stack,
  Badge,
  Loader
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useEffect, useState } from "react";
import { apiRequest } from "./utils/api";
import '@mantine/core/styles.css'

const DeploymentsDashboard = () => {
  const [activeTab, setActiveTab] = useState("grouped");
  const [groupedData, setGroupedData] = useState([]);
  const [dateData, setDateData] = useState([]);
  const [strategies, setStrategies] = useState({});
  const [loading, setLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());

  // 🔹 Format date → YYYY-MM-DD
  const formatDate = (date) => {
  if (!date) return null;

  // If it's already a Date object
  if (date instanceof Date) {
    return date.toISOString().split("T")[0];
  }

  // If it's a string (fallback)
  return new Date(date).toISOString().split("T")[0];
};
  // 🔹 Fetch strategies (map)
  const fetchStrategies = async () => {
    try {
      const res = await apiRequest("GET", "/api/stratergy");

      // convert array → map
      const map = {};
      res.forEach((s) => {
        map[s.id] = s;
      });

      setStrategies(map);
    } catch (err) {
      console.log(err);
    }
  };

  // 🔹 Fetch grouped
  const fetchGrouped = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("GET", "/api/deployments/grouped/strategy");
      setGroupedData(res);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch by date
  const fetchByDate = async (date) => {
    try {
      setLoading(true);
      const formatted = formatDate(date);
      const res = await apiRequest(
        "GET",
        `/api/deployments/by-date?date=${formatted}`
      );
      setDateData(res);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Load strategies once
  useEffect(() => {
    fetchStrategies();
  }, []);

  // 🔹 Tab change
  useEffect(() => {
    if (activeTab === "grouped") {
      fetchGrouped();
    } else {
      fetchByDate(selectedDate);
    }
  }, [activeTab]);

  // 🔹 Date change
  useEffect(() => {
    if (activeTab === "date") {
      fetchByDate(selectedDate);
    }
  }, [selectedDate]);

  return (
    <Box p="md">
      <Text size="1.5rem" fw={600} mb="lg">
        Deployments Dashboard
      </Text>

      {/* 🔹 Tabs */}
      <Group gap="md" mb="xl">
        <Button
          radius="xl"
          style={{
            backgroundColor: activeTab === "grouped" ? "black" : "transparent",
            color: activeTab === "grouped" ? "white" : "#495057"
          }}
          onClick={() => setActiveTab("grouped")}
        >
          Strategy View
        </Button>

        <Button
          radius="xl"
          style={{
            backgroundColor: activeTab === "date" ? "black" : "transparent",
            color: activeTab === "date" ? "white" : "#495057"
          }}
          onClick={() => setActiveTab("date")}
        >
          Date View
        </Button>
      </Group>

      {/* 🔹 Date Picker */}
      {activeTab === "date" && (
        <Box mb="lg">
          <Group mb="lg" align="end">
  <DateInput
    value={selectedDate}
    onChange={setSelectedDate}
    placeholder="Pick date"
    valueFormat="YYYY-MM-DD"
    maw={200}
  />

  <Button
  onClick={() => {
    if (!selectedDate) return;
    fetchByDate(selectedDate);
  }}
>
  Fetch
</Button>
</Group>
        </Box>
      )}

      {loading && <Loader />}

      {/* 🔹 GROUPED VIEW */}
      {activeTab === "grouped" && (
        <Stack>
          {groupedData.map((strategy) => {
            const strategyDetails = strategies[strategy.strategy_id];

            return (
              <Card key={strategy.strategy_id} p="md" radius="lg" withBorder>
                {/* Header */}
                <Stack gap={4} mb="sm">
                  <Text fw={600}>
                    {strategyDetails?.name || "Unknown Strategy"}
                  </Text>

                  <Text size="xs" c="dimmed">
                    {strategyDetails?.description}
                  </Text>
                </Stack>

                <Group mb="sm">
                  <Badge>Total: {strategy.total_deployments}</Badge>
                  <Badge color="green">Live: {strategy.live_count}</Badge>
                  <Badge color="gray">Paper: {strategy.paper_count}</Badge>
                </Group>

                {/* Deployments */}
                <Stack>
                  {strategy.deployments.map((dep) => (
                    <Card key={dep.id} p="sm" radius="md" withBorder>
                      <Group justify="space-between">
                        <Stack gap={2}>
                          <Text size="sm" fw={500}>
                            {dep.user.fullname}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {dep.user.email}
                          </Text>
                        </Stack>

                        <Stack align="flex-end" gap={2}>
                          <Badge variant="outline">{dep.type}</Badge>
                          <Text size="xs">
                            {new Date(dep.deployed_at).toLocaleString()}
                          </Text>
                        </Stack>
                      </Group>
                    </Card>
                  ))}
                </Stack>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* 🔹 DATE VIEW */}
      {activeTab === "date" && (
        <Stack>
          {dateData.map((dep) => {
            const strategyDetails = strategies[dep.strategy_id];

            return (
              <Card key={dep.id} p="md" radius="lg" withBorder>
                <Group justify="space-between">
                  <Stack gap={4}>
                    <Text fw={600}>{dep.fullname}</Text>

                    <Text size="xs" c="dimmed">
                      {dep.email}
                    </Text>

                    <Text size="xs" c="dimmed">
                      {dep.mobile_number}
                    </Text>

                    {/* Strategy Name */}
                    <Text size="sm">
                      {strategyDetails?.name || "Unknown Strategy"}
                    </Text>
                  </Stack>

                  <Stack align="flex-end" gap={4}>
                    <Badge variant="outline">{dep.type}</Badge>
                    <Text size="xs">
                      {new Date(dep.deployed_at).toLocaleString()}
                    </Text>
                  </Stack>
                </Group>
              </Card>
            );
          })}
        </Stack>
      )}
    </Box>
  );
};

export default DeploymentsDashboard;