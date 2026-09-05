import {
  Box,
  Button,
  Loader,
  Table,
  Text,
  Title,
  Group,
  Badge,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import React, { useEffect, useState } from "react";
import { apiRequest } from "./utils/api";
import { useNavigate } from "react-router-dom";


const Emergency_exit = () => {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exitLoading, setExitLoading] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      const res = await apiRequest  ("GET", "/api/stratergy");

      setStrategies(res.strategies || []);
    } catch (err) {
      console.log(err);

      notifications.show({
        color: "red",
        title: "Error",
        message: "Failed to load strategies",
      });
    } finally {
      setLoading(false);
    }
  };

  const emergencyExit = async (strategy) => {
    try {
      setExitLoading(strategy.id);

      const response = await fetch(
        "http://127.0.0.1:8000/recover-strategy",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            strategy_id: strategy.id,
          }),
        }
      );

      const data = await response.json();

      notifications.show({
        color: "green",
        title: "Recovery Completed",
        message: data.message,
      });

      console.log(data);
    } catch (err) {
      console.log(err);

      notifications.show({
        color: "red",
        title: "Error",
        message: "Emergency Exit Failed",
      });
    } finally {
      setExitLoading("");
    }
  };

  if (loading) {
    return (
      <Group justify="center" mt={40}>
        <Loader />
      </Group>
    );
  }

  return (
    <Box p="md">

      <Title order={2} mb="lg">
        Emergency Exit
      </Title>

      <Button onClick={() => navigate("/emergency-trade-exit")} >
        Emergency Exit All Strategies
      </Button>

      <Table p={4} highlightOnHover withTableBorder>

        <Table.Thead>

          <Table.Tr>
            <Table.Th p={10}>Strategy</Table.Th>
            <Table.Th  p={10}>Category</Table.Th>
            <Table.Th p={10}>Status</Table.Th>
            <Table.Th p={10} style={{ width: 220 }}>
              Action
            </Table.Th>
          </Table.Tr>

        </Table.Thead>

        <Table.Tbody>

          {strategies.map((strategy) => (
            <Table.Tr key={strategy.id}>

              <Table.Td>
                {strategy.name}
              </Table.Td>

              <Table.Td>
                {strategy.category}
              </Table.Td>

              <Table.Td>
                <Badge
                  color={strategy.status === "active" ? "green" : "gray"}
                >
                  {strategy.status}
                </Badge>
              </Table.Td>

              <Table.Td>
                <Button
                  color="red"
                  loading={exitLoading === strategy.id}
                  onClick={() => emergencyExit(strategy)}
                >
                  Emergency Exit
                </Button>
              </Table.Td>

            </Table.Tr>
          ))}

        </Table.Tbody>

      </Table>

    </Box>
  );
};

export default Emergency_exit;