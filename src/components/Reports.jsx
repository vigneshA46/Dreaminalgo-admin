import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Select,
  Table,
  Text,
  Card,
  Group,
  Loader,
  Collapse,
  ScrollArea,
} from "@mantine/core";
import { apiRequest } from "./utils/api";

const Reports = () => {
  const [view, setView] = useState("strategy");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openedRow, setOpenedRow] = useState(null);

  const endpointMap = {
    strategy: "/api/reports/admin/deployments/strategy",
    broker: "/api/reports/admin/deployments/broker",
    user: "/api/reports/admin/deployments/user",
    date: "/api/reports/admin/deployments/date",
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const endpoi = endpointMap[view]
      const res = await apiRequest('GET' , endpoi);
      setData(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [view]);

  const renderHeader = () => {
    switch (view) {
      case "strategy":
        return ["Strategy", "Deployments", "Users"];
      case "broker":
        return ["Broker", "Deployments", "Users"];
      case "user":
        return ["User", "Deployments", "Strategies"];
      case "date":
        return ["Date", "Deployments", "Users"];
      default:
        return [];
    }
  };

  const getRowMain = (row) => {
    switch (view) {
      case "strategy":
        return row.name || "Unknown";
      case "broker":
        return row.broker;
      case "user":
        return row.fullname;
      case "date":
        return new Date(row.date).toLocaleDateString();
      default:
        return "";
    }
  };

  return (
    <Box bg="#ffffff" mih="100vh" py="xl">
      <Container size="xl">
        
        {/* Header */}
        <Group justify="space-between" mb="lg">
          <Text size="xl" fw={600} c="black">
            Reports Dashboard
          </Text>

          <Select
            value={view}
            onChange={setView}
            data={[
              { value: "strategy", label: "Strategy Wise" },
              { value: "broker", label: "Broker Wise" },
              { value: "user", label: "User Wise" },
              { value: "date", label: "Date Wise" },
            ]}
            styles={{
              input: {
                backgroundColor: "#ffffff",
                color: "black",
                border: "1px solid #222",
              },
            }}
          />
        </Group>

        {/* Content */}
        <Card bg="#ffffff" withBorder p="md" radius="md">
          {loading ? (
            <Loader color="black" />
          ) : (
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="md">
                <Table.Thead>
                  <Table.Tr>
                    {renderHeader().map((h, i) => (
                      <Table.Th key={i}>
                        <Text c="black">{h}</Text>
                      </Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                  {data.map((row, index) => (
                    <React.Fragment key={index}>
                      <Table.Tr
                        onClick={() =>
                          setOpenedRow(openedRow === index ? null : index)
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <Table.Td>
                          <Text c="black">{getRowMain(row)}</Text>
                        </Table.Td>

                        <Table.Td>
                          <Text c="black">
                            {row.total_deployments}
                          </Text>
                        </Table.Td>

                        <Table.Td>
                          <Text c="black">
                            {row.total_users || row.strategies_used}
                          </Text>
                        </Table.Td>
                      </Table.Tr>

                      {/* Expandable Row */}
                      <Table.Tr>
                        <Table.Td colSpan={3} p={0}>
                          <Collapse in={openedRow === index}>
                            <Box p="sm" bg="#ffffff">
                              {row.deployments?.map((d, i) => (
                                <Card
                                  key={i}
                                  mb="xs"
                                  p="sm"
                                  bg="#ffffff"
                                  radius="md"
                                >
                                  <Group justify="space-between">
                                    <Text c="black" size="sm">
                                      {d.strategy_name || "No Strategy"}
                                    </Text>
                                    <Text size="xs" c="gray">
                                      {d.type}
                                    </Text>
                                  </Group>

                                  <Group mt={4} gap="xs">
                                    <Text size="xs" c="gray.5">
                                      {d.user?.fullname}
                                    </Text>
                                    <Text size="xs" c="gray.6">
                                      • {d.status}
                                    </Text>
                                    <Text size="xs" c="gray.6">
                                      • x{d.multiplier}
                                    </Text>
                                  </Group>

                                  <Text size="xs" c="gray.6" mt={4}>
                                    {new Date(d.deployed_at).toLocaleString()}
                                  </Text>
                                </Card>
                              ))}
                            </Box>
                          </Collapse>
                        </Table.Td>
                      </Table.Tr>
                    </React.Fragment>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          )}
        </Card>
      </Container>
    </Box>
  );
};

export default Reports;