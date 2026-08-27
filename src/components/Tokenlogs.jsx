import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Group,
  TextInput,
  Select,
  Button,
  Table,
  Paper,
  Badge,
  Loader,
  Center,
  Stack,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { apiRequest } from "./utils/api";
import "@mantine/core/styles.css";

const Tokenlogs = () => {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const [loading, setLoading] = useState(false);

  // --------------------------------------------------
  // Fetch Token Logs
  // --------------------------------------------------

  const fetchTokenLogs = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (selectedUser) {
        params.append("user_id", selectedUser);
      }

      if (fromDate) {
        params.append(
          "from_date",
          formatDate(fromDate)
        );
      }

      if (toDate) {
        params.append(
          "to_date",
          formatDate(toDate)
        );
      }

      const queryString = params.toString();

      const endpoint = queryString
        ? `/api/tokenlogs?${queryString}`
        : "/api/tokenlogs";

      const res = await apiRequest("GET", endpoint);

      setLogs(res || []);

    } catch (err) {
      console.log("Error fetching token logs:", err);
    } finally {
      setLoading(false);
    }
  };


  // --------------------------------------------------
  // Fetch Users for User Filter
  // --------------------------------------------------

  const fetchUsers = async () => {
    try {
      const res = await apiRequest(
        "POST",
        "/api/users"
      );

      setUsers(res || []);

    } catch (err) {
      console.log("Error fetching users:", err);
    }
  };


  // --------------------------------------------------
  // Date Formatter
  // --------------------------------------------------

  const formatDate = (date) => {
    if (!date) return "";

    const d = new Date(date);

    const year = d.getFullYear();
    const month = String(
      d.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      d.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };


  // --------------------------------------------------
  // Format Created Date
  // --------------------------------------------------

  const formatCreatedDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };


  // --------------------------------------------------
  // Initial Load
  // --------------------------------------------------

  useEffect(() => {
    fetchTokenLogs();
    fetchUsers();
  }, []);


  // --------------------------------------------------
  // Clear Filters
  // --------------------------------------------------

  const clearFilters = () => {
    setSearch("");
    setSelectedUser(null);
    setFromDate(null);
    setToDate(null);

    // Fetch all logs again
    setTimeout(() => {
      fetchTokenLogs();
    }, 0);
  };


  // --------------------------------------------------
  // User Dropdown Data
  // --------------------------------------------------

  const userOptions = users.map((user) => ({
    value: user.id,
    label: `${user.fullname || "No Name"} - ${
      user.email || "No Email"
    }`,
  }));


  return (
    <Box p="md">

      {/* Header */}

      <Group
        justify="space-between"
        mb="lg"
      >
        <div>
          <Text
            size="xl"
            fw={700}
          >
            Token Logs
          </Text>

          <Text
            size="sm"
            c="dimmed"
          >
            Track all token updates made to users
          </Text>
        </div>

        <Button
          variant="light"
          onClick={fetchTokenLogs}
        >
          Refresh
        </Button>
      </Group>


      {/* Filters */}

      <Paper
        withBorder
        p="md"
        mb="lg"
        radius="md"
      >

        <Group
          align="flex-end"
          grow
        >

          <TextInput
            label="Search User"
            placeholder="Name, email or mobile"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />


          <Select
            label="User"
            placeholder="Select user"
            searchable
            clearable
            data={userOptions}
            value={selectedUser}
            onChange={setSelectedUser}
          />


          <DateInput
            label="From Date"
            placeholder="Select date"
            clearable
            value={fromDate}
            onChange={setFromDate}
          />


          <DateInput
            label="To Date"
            placeholder="Select date"
            clearable
            value={toDate}
            onChange={setToDate}
          />


          <Group
            gap="xs"
            style={{
              flexGrow: 0,
            }}
          >
            <Button
              onClick={fetchTokenLogs}
              style={{
                backgroundColor: "black",
              }}
            >
              Apply
            </Button>

            <Button
              variant="light"
              color="gray"
              onClick={clearFilters}
            >
              Clear
            </Button>
          </Group>

        </Group>

      </Paper>


      {/* Table */}

      <Paper
        withBorder
        radius="md"
        style={{
          overflowX: "auto",
        }}
      >

        {loading ? (

          <Center p="xl">
            <Loader />
          </Center>

        ) : logs.length === 0 ? (

          <Center p="xl">
            <Stack
              align="center"
              gap="xs"
            >
              <Text fw={500}>
                No token logs found
              </Text>

              <Text
                size="sm"
                c="dimmed"
              >
                Try changing your filters.
              </Text>
            </Stack>
          </Center>

        ) : (

          <Table
            striped
            highlightOnHover
            verticalSpacing="sm"
            horizontalSpacing="md"
          >

            <Table.Thead>

              <Table.Tr>

                <Table.Th>
                  User
                </Table.Th>

                <Table.Th>
                  Previous Tokens
                </Table.Th>

                <Table.Th>
                  Updated Tokens
                </Table.Th>

                <Table.Th>
                  Change
                </Table.Th>

                <Table.Th>
                  Note
                </Table.Th>

                <Table.Th>
                  Date
                </Table.Th>

              </Table.Tr>

            </Table.Thead>


            <Table.Tbody>

              {logs.map((log) => {

                const previous =
                  Number(
                    log.previous_tokens
                  );

                const updated =
                  Number(
                    log.updated_tokens
                  );

                const difference =
                  updated - previous;

                return (

                  <Table.Tr
                    key={log.id}
                  >

                    {/* User */}

                    <Table.Td>

                      <Stack gap={0}>

                        <Text fw={600}>
                          {log.fullname ||
                            "Unknown User"}
                        </Text>

                        <Text
                          size="xs"
                          c="dimmed"
                        >
                          {log.email || "-"}
                        </Text>

                        <Text
                          size="xs"
                          c="dimmed"
                        >
                          {log.mobile_number ||
                            "-"}
                        </Text>

                      </Stack>

                    </Table.Td>


                    {/* Previous */}

                    <Table.Td>
                      <Text fw={500}>
                        {previous}
                      </Text>
                    </Table.Td>


                    {/* Updated */}

                    <Table.Td>
                      <Text fw={600}>
                        {updated}
                      </Text>
                    </Table.Td>


                    {/* Difference */}

                    <Table.Td>

                      <Badge
                        color={
                          difference >= 0
                            ? "green"
                            : "red"
                        }
                        variant="light"
                      >
                        {difference >= 0
                          ? `+${difference}`
                          : difference}
                      </Badge>

                    </Table.Td>


                    {/* Note */}

                    <Table.Td>

                      <Text
                        size="sm"
                        maw={300}
                        style={{
                          whiteSpace:
                            "normal",
                          wordBreak:
                            "break-word",
                        }}
                      >
                        {log.notes || "-"}
                      </Text>

                    </Table.Td>


                    {/* Date */}

                    <Table.Td>

                      <Text size="sm">
                        {formatCreatedDate(
                          log.createdat
                        )}
                      </Text>

                    </Table.Td>

                  </Table.Tr>

                );

              })}

            </Table.Tbody>

          </Table>

        )}

      </Paper>

    </Box>
  );
};

export default Tokenlogs;