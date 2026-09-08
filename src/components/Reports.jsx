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
  TextInput,
  Button,
  Flex,
} from "@mantine/core";

import { apiRequest } from "./utils/api";

const Reports = () => {
  /* =========================================================
     REPORT VIEW
  ========================================================= */

  const [view, setView] = useState("strategy");

  // Data currently displayed in the table
  const [data, setData] = useState([]);

  // Complete unfiltered data returned by API
  const [allData, setAllData] = useState([]);

  const [loading, setLoading] = useState(false);

  const [openedRow, setOpenedRow] = useState(null);

  /* =========================================================
     USERS
  ========================================================= */

  const [users, setUsers] = useState([]);

  const [usersLoading, setUsersLoading] = useState(false);

  /* =========================================================
     FILTER INPUTS
  ========================================================= */

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const getDefaultFromDate = () => {
    const date = new Date();

    date.setDate(date.getDate() - 30);

    return date.toISOString().split("T")[0];
  };

  const [fromDate, setFromDate] = useState(
    getDefaultFromDate()
  );

  const [toDate, setToDate] = useState(
    getTodayDate()
  );

  const [selectedUser, setSelectedUser] = useState("all");

  /* =========================================================
     APPLIED FILTERS
  ========================================================= */

  const [appliedFilters, setAppliedFilters] = useState({
    startDate: getDefaultFromDate(),
    endDate: getTodayDate(),
    userId: "all",
  });

  /* =========================================================
     ENDPOINT MAP
  ========================================================= */

  const endpointMap = {
    strategy:
      "/api/reports/admin/deployments/strategy",

    broker:
      "/api/reports/admin/deployments/broker",

    user:
      "/api/reports/admin/deployments/user",

    date:
      "/api/reports/admin/deployments/date",
  };

  /* =========================================================
     FETCH USERS
  ========================================================= */

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);

      const response = await apiRequest(
        "GET",
        "/api/users"
      );

      console.log("Users Response:", response);

      setUsers(
        response?.data ||
        response?.users ||
        []
      );

    } catch (error) {
      console.error(
        "Fetch Users Error:",
        error
      );
    } finally {
      setUsersLoading(false);
    }
  };

  /* =========================================================
     FETCH ALL REPORT DATA
     
     IMPORTANT:
     NO FILTERS ARE SENT TO BACKEND.
  ========================================================= */

  const fetchData = async () => {
    try {
      setLoading(true);

      setOpenedRow(null);

      const endpoint = endpointMap[view];

      console.log(
        "Fetching ALL Report Data:",
        endpoint
      );

      const response = await apiRequest(
        "GET",
        endpoint
      );

      console.log(
        "Report Response:",
        response
      );

      const reportData =
        response?.data || [];

      // Store complete API response
      setAllData(reportData);

      // Apply currently selected frontend filters
      const filteredData =
        filterReportData(
          reportData,
          appliedFilters
        );

      setData(filteredData);

    } catch (err) {
      console.error(
        "Fetch Report Error:",
        err
      );

      setAllData([]);

      setData([]);

    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     FILTER REPORT DATA
     
     EVERYTHING BELOW HAPPENS IN FRONTEND.
  ========================================================= */

  const filterReportData = (
    reportData,
    filters
  ) => {
    if (!Array.isArray(reportData)) {
      return [];
    }

    /*
      Convert selected dates to boundaries.

      From date:
      00:00:00

      To date:
      23:59:59
    */

    const startDate = filters.startDate
      ? new Date(
          `${filters.startDate}T00:00:00`
        )
      : null;

    const endDate = filters.endDate
      ? new Date(
          `${filters.endDate}T23:59:59.999`
        )
      : null;

    return reportData
      .map((row) => {

        /*
          Every report row contains deployments.

          We filter those deployments first.
        */

        const deployments =
          Array.isArray(row.deployments)
            ? row.deployments
            : [];

        const filteredDeployments =
          deployments.filter((deployment) => {

            /* =========================================
               DATE FILTER
            ========================================= */

            if (!deployment.deployed_at) {
              return false;
            }

            const deploymentDate =
              new Date(
                deployment.deployed_at
              );

            if (
              Number.isNaN(
                deploymentDate.getTime()
              )
            ) {
              return false;
            }

            if (
              startDate &&
              deploymentDate < startDate
            ) {
              return false;
            }

            if (
              endDate &&
              deploymentDate > endDate
            ) {
              return false;
            }

            /* =========================================
               USER FILTER
            ========================================= */

            if (
              filters.userId &&
              filters.userId !== "all"
            ) {

              const deploymentUserId =
                deployment.user?.id ||
                deployment.user_id;

              if (
                String(deploymentUserId) !==
                String(filters.userId)
              ) {
                return false;
              }
            }

            return true;
          });

        /*
          If this report row has no deployments
          after filtering, remove the row.
        */

        if (
          filteredDeployments.length === 0
        ) {
          return null;
        }

        /* =========================================
           RECALCULATE USERS
        ========================================= */

        const uniqueUserIds =
          new Set();

        filteredDeployments.forEach(
          (deployment) => {

            const userId =
              deployment.user?.id ||
              deployment.user_id;

            if (userId) {
              uniqueUserIds.add(
                String(userId)
              );
            }
          }
        );

        /*
          If user ID isn't available,
          fallback to fullname.
        */

        if (
          uniqueUserIds.size === 0
        ) {

          filteredDeployments.forEach(
            (deployment) => {

              const fullname =
                deployment.user?.fullname;

              if (fullname) {
                uniqueUserIds.add(
                  fullname
                );
              }
            }
          );
        }

        const filteredUserCount =
          uniqueUserIds.size;

        /* =========================================
           RETURN UPDATED ROW
        ========================================= */

        return {
          ...row,

          deployments:
            filteredDeployments,

          // IMPORTANT:
          // Recalculate instead of using API count

          total_deployments:
            filteredDeployments.length,

          total_users:
            filteredUserCount,

          strategies_used:
            filteredUserCount,
        };
      })
      .filter(Boolean);
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    fetchUsers();
  }, []);

  /* =========================================================
     LOAD REPORT WHEN VIEW CHANGES
     
     Backend still returns ALL data.
  ========================================================= */

  useEffect(() => {
    fetchData();
  }, [view]);

  /* =========================================================
     APPLY FILTER
     
     IMPORTANT:
     NO API CALL HERE.
     
     We simply filter allData in frontend.
  ========================================================= */

  const handleApply = () => {
    if (!fromDate || !toDate) {
      return;
    }

    if (fromDate > toDate) {
      return;
    }

    const newFilters = {
      startDate: fromDate,
      endDate: toDate,
      userId: selectedUser,
    };

    setAppliedFilters(newFilters);

    /*
      Filter existing API data.
    */

    const filteredData =
      filterReportData(
        allData,
        newFilters
      );

    setData(filteredData);

    setOpenedRow(null);
  };

  /* =========================================================
     RESET FILTERS
     
     Reset also happens completely in frontend.
  ========================================================= */

  const handleReset = () => {
    const defaultFrom =
      getDefaultFromDate();

    const defaultTo =
      getTodayDate();

    setFromDate(defaultFrom);

    setToDate(defaultTo);

    setSelectedUser("all");

    const newFilters = {
      startDate: defaultFrom,
      endDate: defaultTo,
      userId: "all",
    };

    setAppliedFilters(newFilters);

    const filteredData =
      filterReportData(
        allData,
        newFilters
      );

    setData(filteredData);

    setOpenedRow(null);
  };

  /* =========================================================
     REPORT HEADERS
  ========================================================= */

  const renderHeader = () => {
    switch (view) {

      case "strategy":
        return [
          "Strategy",
          "Deployments",
          "Users",
        ];

      case "broker":
        return [
          "Broker",
          "Deployments",
          "Users",
        ];

      case "user":
        return [
          "User",
          "Deployments",
          "Strategies",
        ];

      case "date":
        return [
          "Date",
          "Deployments",
          "Users",
        ];

      default:
        return [];
    }
  };

  /* =========================================================
     MAIN ROW VALUE
  ========================================================= */

  const getRowMain = (row) => {
    switch (view) {

      case "strategy":
        return row.name || "Unknown";

      case "broker":
        return row.broker || "Unknown";

      case "user":
        return row.fullname || "Unknown";

      case "date":
        return row.date
          ? new Date(
              row.date
            ).toLocaleDateString()
          : "-";

      default:
        return "";
    }
  };

  /* =========================================================
     USER SELECT OPTIONS
  ========================================================= */

  const userOptions = [
    {
      value: "all",
      label: "All Users",
    },

    ...users.map((user) => ({
      value: user.id,

      label:
        user.fullname ||
        user.name ||
        user.email ||
        "Unknown User",
    })),
  ];

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <Box
      bg="#ffffff"
      mih="100vh"
      py="xl"
    >

      <Container size="xl">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <Group
          justify="space-between"
          mb="lg"
        >

          <Text
            size="xl"
            fw={600}
            c="black"
          >
            Reports Dashboard
          </Text>

          <Select
            value={view}
            onChange={(value) =>
              setView(
                value || "strategy"
              )
            }
            data={[
              {
                value: "strategy",
                label: "Strategy Wise",
              },
              {
                value: "broker",
                label: "Broker Wise",
              },
              {
                value: "user",
                label: "User Wise",
              },
              {
                value: "date",
                label: "Date Wise",
              },
            ]}
            styles={{
              input: {
                backgroundColor:
                  "#ffffff",
                color: "black",
                border:
                  "1px solid #222",
              },
            }}
          />

        </Group>

        {/* =====================================================
            FILTER SECTION
        ===================================================== */}

        <Card
          bg="#ffffff"
          withBorder
          p="md"
          radius="md"
          mb="lg"
        >

          <Text
            fw={600}
            size="sm"
            mb="sm"
            c="black"
          >
            Report Filters
          </Text>

          <Flex
            gap="md"
            align="flex-end"
            wrap="wrap"
          >

            {/* FROM DATE */}

            <TextInput
              label="From Date"
              type="date"
              value={fromDate}
              onChange={(event) =>
                setFromDate(
                  event.currentTarget.value
                )
              }
              styles={{
                input: {
                  backgroundColor:
                    "#ffffff",
                  color: "black",
                },
              }}
              style={{
                minWidth: 180,
              }}
            />

            {/* TO DATE */}

            <TextInput
              label="To Date"
              type="date"
              value={toDate}
              onChange={(event) =>
                setToDate(
                  event.currentTarget.value
                )
              }
              styles={{
                input: {
                  backgroundColor:
                    "#ffffff",
                  color: "black",
                },
              }}
              style={{
                minWidth: 180,
              }}
            />

            {/* USER */}

            <Select
              label="User"
              placeholder="Select user"
              data={userOptions}
              value={selectedUser}
              onChange={(value) =>
                setSelectedUser(
                  value || "all"
                )
              }
              searchable
              clearable={false}
              nothingFoundMessage="No users found"
              disabled={usersLoading}
              rightSection={
                usersLoading
                  ? <Loader size="xs" />
                  : undefined
              }
              styles={{
                input: {
                  backgroundColor:
                    "#ffffff",
                  color: "black",
                },
              }}
              style={{
                minWidth: 240,
              }}
            />

            {/* APPLY */}

            <Button
              onClick={handleApply}
              loading={loading}
            >
              Apply
            </Button>

            {/* RESET */}

            <Button
              variant="default"
              onClick={handleReset}
              disabled={loading}
            >
              Reset
            </Button>

          </Flex>

        </Card>

        {/* =====================================================
            APPLIED FILTER INFORMATION
        ===================================================== */}

        <Group
          mb="md"
          gap="xs"
        >

          <Text
            size="sm"
            c="dimmed"
          >
            Showing report from
          </Text>

          <Text
            size="sm"
            fw={600}
            c="black"
          >
            {appliedFilters.startDate}
          </Text>

          <Text
            size="sm"
            c="dimmed"
          >
            to
          </Text>

          <Text
            size="sm"
            fw={600}
            c="black"
          >
            {appliedFilters.endDate}
          </Text>

          {appliedFilters.userId !== "all" && (
            <>
              <Text
                size="sm"
                c="dimmed"
                ml="sm"
              >
                • User:
              </Text>

              <Text
                size="sm"
                fw={600}
                c="black"
              >
                {
                  users.find(
                    (user) =>
                      String(user.id) ===
                      String(
                        appliedFilters.userId
                      )
                  )?.fullname ||
                  "Selected User"
                }
              </Text>
            </>
          )}

        </Group>

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <Card
          bg="#ffffff"
          withBorder
          p="md"
          radius="md"
        >

          {loading ? (

            <Box py={60}>
              <Group justify="center">
                <Loader color="black" />
              </Group>
            </Box>

          ) : (

            <ScrollArea>

              <Table
                highlightOnHover
                verticalSpacing="md"
              >

                {/* =================================================
                    HEADER
                ================================================= */}

                <Table.Thead>

                  <Table.Tr>

                    {renderHeader().map(
                      (h, i) => (

                        <Table.Th key={i}>
                          <Text c="black">
                            {h}
                          </Text>
                        </Table.Th>

                      )
                    )}

                  </Table.Tr>

                </Table.Thead>

                {/* =================================================
                    BODY
                ================================================= */}

                <Table.Tbody>

                  {data.length === 0 ? (

                    <Table.Tr>

                      <Table.Td
                        colSpan={3}
                      >

                        <Text
                          ta="center"
                          c="dimmed"
                          py="xl"
                        >
                          No report data found
                        </Text>

                      </Table.Td>

                    </Table.Tr>

                  ) : (

                    data.map(
                      (row, index) => (

                        <React.Fragment
                          key={index}
                        >

                          {/* =======================================
                              MAIN ROW
                          ======================================= */}

                          <Table.Tr
                            onClick={() =>
                              setOpenedRow(
                                openedRow === index
                                  ? null
                                  : index
                              )
                            }
                            style={{
                              cursor:
                                "pointer",
                            }}
                          >

                            <Table.Td>

                              <Text c="black">
                                {
                                  getRowMain(
                                    row
                                  )
                                }
                              </Text>

                            </Table.Td>

                            <Table.Td>

                              <Text c="black">
                                {
                                  row.total_deployments
                                }
                              </Text>

                            </Table.Td>

                            <Table.Td>

                              <Text c="black">
                                {
                                  view === "user"
                                    ? (
                                        row.strategies_used ??
                                        row.total_users ??
                                        0
                                      )
                                    : (
                                        row.total_users ??
                                        0
                                      )
                                }
                              </Text>

                            </Table.Td>

                          </Table.Tr>

                          {/* =======================================
                              EXPANDED ROW
                          ======================================= */}

                          <Table.Tr>

                            <Table.Td
                              colSpan={3}
                              p={0}
                            >

                              <Collapse
                                in={
                                  openedRow === index
                                }
                              >

                                <Box
                                  p="sm"
                                  bg="#ffffff"
                                >

                                  {
                                    row.deployments?.length >
                                    0 ? (

                                      row.deployments.map(
                                        (
                                          d,
                                          i
                                        ) => (

                                          <Card
                                            key={i}
                                            mb="xs"
                                            p="sm"
                                            bg="#ffffff"
                                            radius="md"
                                            withBorder
                                          >

                                            <Group
                                              justify="space-between"
                                            >

                                              <Text
                                                size="xs"
                                                c="gray"
                                              >
                                                {
                                                  d.type
                                                }
                                              </Text>

                                            </Group>

                                            <Group
                                              mt={4}
                                              gap="xs"
                                            >

                                              <Text
                                                size="xs"
                                                c="gray.5"
                                              >
                                                {
                                                  d.user
                                                    ?.fullname
                                                }
                                              </Text>

                                              <Text
                                                size="xs"
                                                c="gray.6"
                                              >
                                                •{" "}
                                                {
                                                  d.status
                                                }
                                              </Text>

                                              <Text
                                                size="xs"
                                                c="gray.6"
                                              >
                                                • x
                                                {
                                                  d.multiplier
                                                }
                                              </Text>

                                            </Group>

                                            <Text
                                              size="xs"
                                              c="gray.6"
                                              mt={4}
                                            >
                                              {
                                                d.deployed_at
                                                  ? new Date(
                                                      d.deployed_at
                                                    ).toLocaleString()
                                                  : "-"
                                              }
                                            </Text>

                                          </Card>

                                        )
                                      )

                                    ) : (

                                      <Text
                                        size="xs"
                                        c="dimmed"
                                        py="sm"
                                      >
                                        No deployment
                                        details
                                        available.
                                      </Text>

                                    )
                                  }

                                </Box>

                              </Collapse>

                            </Table.Td>

                          </Table.Tr>

                        </React.Fragment>

                      )
                    )

                  )}

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
