import {
  Table,
  Text,
  Paper,
  ScrollArea,
  Badge,
  Stack,
  Loader,
  Center,
  TextInput,
  Button,
  Group,
} from "@mantine/core";

import React, { useEffect, useState } from "react";
import { apiRequest } from "./utils/api";

const Broker = () => {
  const [brokers, setBrokers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Margin state
  const [marginData, setMarginData] = useState({});
  const [marginLoading, setMarginLoading] = useState({});

  const fetchallbroekr = async () => {
    try {
      setLoading(true);

      const res = await apiRequest(
        "GET",
        "/api/broker/all-with-users"
      );

      console.log(res);

      if (res?.success) {
        setBrokers(res.brokers || []);
      } else {
        setBrokers([]);
      }
    } catch (err) {
      console.error("Failed to fetch brokers:", err);
      setBrokers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchallbroekr();
  }, []);

  /*
    GET ZEBU MYNT MARGIN
  */
 const handleGetMargin = async (broker) => {
  try {
    setMarginLoading((prev) => ({
      ...prev,
      [broker.broker_id]: true,
    }));

    const credentials = broker.credentials || {};

    const {
      uid,
      actid,
      jKey,
      password,
      apiKey,
      factor2,
    } = credentials;

    console.log("Zebu credentials available:", {
      uid: !!uid,
      actid: !!actid,
      jKey: !!jKey,
      password: !!password,
      apiKey: !!apiKey,
      factor2: !!factor2,
    });

    if (!uid) {
      throw new Error("Zebu UID is missing");
    }

    if (!password) {
      throw new Error("Zebu password is missing");
    }

    if (!apiKey) {
      throw new Error("Zebu API key is missing");
    }

    if (!factor2) {
      throw new Error("Zebu TOTP secret (factor2) is missing");
    }

    const res = await apiRequest(
      "POST",
      "/api/broker/zebumynt/margin",
      {
        uid,
        actid,
        jKey,
        password,
        apiKey,
        factor2,

        // Replace if your actual vendor code is different
        vendorCode: "ZEBU",
      }
    );

    console.log("Zebu margin response:", res);

    if (!res?.success) {
      throw new Error(
        res?.error || "Failed to fetch Zebu margin"
      );
    }

    setMarginData((prev) => ({
      ...prev,
      [broker.broker_id]: res,
    }));

    // If backend refreshed the session,
    // update the local broker object.
    if (res.session?.jKey) {
      setBrokers((prev) =>
        prev.map((item) => {
          if (item.broker_id !== broker.broker_id) {
            return item;
          }

          return {
            ...item,
            credentials: {
              ...item.credentials,
              jKey: res.session.jKey,
              actid:
                res.session.actid ||
                item.credentials.actid,
            },
          };
        })
      );
    }

  } catch (error) {
    console.error(
      "Get Zebu Margin Error:",
      error
    );

    setMarginData((prev) => ({
      ...prev,
      [broker.broker_id]: {
        error: error.message,
      },
    }));

  } finally {
    setMarginLoading((prev) => ({
      ...prev,
      [broker.broker_id]: false,
    }));
  }
};

  /*
    GLOBAL SEARCH

    Searches through the entire broker object.
  */
  const filteredBrokers = brokers.filter((broker) => {
    if (!search.trim()) {
      return true;
    }

    const searchValue = search.toLowerCase().trim();

    return JSON.stringify(broker)
      .toLowerCase()
      .includes(searchValue);
  });

  if (loading) {
    return (
      <Center h={300}>
        <Loader />
      </Center>
    );
  }

  return (
    <Paper
      shadow="sm"
      radius="md"
      p="md"
      withBorder
    >
      <Stack gap="md">

        {/* HEADER */}
        <Text fw={700} size="xl">
          Broker Accounts
        </Text>

        {/* SEARCH */}
        <TextInput
          placeholder="Search name, email, phone, broker, UUID, credentials..."
          value={search}
          onChange={(event) =>
            setSearch(event.currentTarget.value)
          }
          size="md"
        />

        {/* COUNT */}
        <Text size="sm" c="dimmed">
          Showing {filteredBrokers.length} of {brokers.length} broker accounts
        </Text>

        {/* TABLE */}
        <ScrollArea>

          <Table
            striped
            highlightOnHover
            withTableBorder
            withColumnBorders
            verticalSpacing="sm"
            miw={1700}
          >

            <Table.Thead>
              <Table.Tr>

                <Table.Th>#</Table.Th>

                <Table.Th>User ID</Table.Th>

                <Table.Th>Broker ID</Table.Th>

                <Table.Th>User</Table.Th>

                <Table.Th>Email</Table.Th>

                <Table.Th>Mobile</Table.Th>

                <Table.Th>Broker</Table.Th>

                <Table.Th>Broker Status</Table.Th>

                <Table.Th>Credentials</Table.Th>

                <Table.Th>Margin</Table.Th>

                <Table.Th>User Status</Table.Th>

                <Table.Th>Tokens</Table.Th>

                <Table.Th>Created At</Table.Th>

              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>

              {filteredBrokers.length === 0 ? (

                <Table.Tr>

                  <Table.Td colSpan={13}>

                    <Center py="xl">

                      <Text c="dimmed">
                        {search
                          ? "No broker accounts match your search"
                          : "No broker accounts found"}
                      </Text>

                    </Center>

                  </Table.Td>

                </Table.Tr>

              ) : (

                filteredBrokers.map((broker, index) => {

                  const brokerId = broker.broker_id;

                  const isZebu =
                    broker.broker_name?.toLowerCase() ===
                    "zebumynt";

                  const currentMargin =
                    marginData[brokerId];

                  const isMarginLoading =
                    marginLoading[brokerId];

                  return (
                    <Table.Tr key={brokerId}>

                      {/* INDEX */}
                      <Table.Td>
                        {index + 1}
                      </Table.Td>

                      {/* USER ID */}
                      <Table.Td>
                        <Text
                          size="xs"
                          ff="monospace"
                          style={{
                            whiteSpace: "nowrap",
                          }}
                        >
                          {broker.user_id || "-"}
                        </Text>
                      </Table.Td>

                      {/* BROKER ID */}
                      <Table.Td>
                        <Text
                          size="xs"
                          ff="monospace"
                          style={{
                            whiteSpace: "nowrap",
                          }}
                        >
                          {broker.broker_id || "-"}
                        </Text>
                      </Table.Td>

                      {/* USER */}
                      <Table.Td>
                        <Text fw={600}>
                          {broker.user_fullname || "-"}
                        </Text>
                      </Table.Td>

                      {/* EMAIL */}
                      <Table.Td>
                        {broker.user_email || "-"}
                      </Table.Td>

                      {/* MOBILE */}
                      <Table.Td>
                        {broker.user_mobile || "-"}
                      </Table.Td>

                      {/* BROKER */}
                      <Table.Td>
                        <Text fw={500}>
                          {broker.broker_name || "-"}
                        </Text>
                      </Table.Td>

                      {/* BROKER STATUS */}
                      <Table.Td>
                        <Badge
                          color={
                            broker.broker_status ===
                            "connected"
                              ? "green"
                              : "red"
                          }
                        >
                          {broker.broker_status ||
                            "Unknown"}
                        </Badge>
                      </Table.Td>

                      {/* CREDENTIALS */}
                      <Table.Td>
                        <Stack gap={2}>

                          {broker.credentials &&
                          Object.keys(
                            broker.credentials
                          ).length > 0 ? (

                            Object.entries(
                              broker.credentials
                            ).map(
                              ([key, value]) => (

                                <Text
                                  key={key}
                                  size="xs"
                                  style={{
                                    whiteSpace:
                                      "nowrap",
                                  }}
                                >
                                  <Text
                                    component="span"
                                    fw={600}
                                  >
                                    {key}:
                                  </Text>{" "}

                                  {String(value)}

                                </Text>

                              )
                            )

                          ) : (

                            <Text
                              size="xs"
                              c="dimmed"
                            >
                              No credentials
                            </Text>

                          )}

                        </Stack>
                      </Table.Td>

                      {/* MARGIN */}
                      <Table.Td>

                        {!isZebu ? (

                          <Text
                            size="xs"
                            c="dimmed"
                          >
                            -
                          </Text>

                        ) : (

                          <Stack gap="xs">

                            <Button
                              size="xs"
                              variant="light"
                              color="blue"
                              loading={isMarginLoading}
                              onClick={() =>
                                handleGetMargin(
                                  broker
                                )
                              }
                            >
                              {currentMargin?.success
                                ? "Refresh Margin"
                                : "See Margin"}
                            </Button>

                            {/* SUCCESS */}
                            {currentMargin?.success && (

                              <Paper
                                p="xs"
                                withBorder
                                radius="sm"
                              >

                                <Stack gap={2}>

                                  <Text
                                    size="xs"
                                    c="dimmed"
                                  >
                                    Available Margin
                                  </Text>

                                  <Text
                                    fw={700}
                                    size="md"
                                  >
                                    ₹{" "}
                                    {Number(
                                      currentMargin.availableMargin ||
                                      0
                                    ).toLocaleString(
                                      "en-IN",
                                      {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      }
                                    )}
                                  </Text>

                                  {currentMargin
                                    .margin && (

                                    <>

                                      <Text
                                        size="xs"
                                        c="dimmed"
                                      >
                                        Used: ₹{" "}
                                        {Number(
                                          currentMargin
                                            .margin
                                            .marginUsed ||
                                          0
                                        ).toLocaleString(
                                          "en-IN"
                                        )}
                                      </Text>

                                      <Text
                                        size="xs"
                                        c="dimmed"
                                      >
                                        P&L: ₹{" "}
                                        {Number(
                                          (
                                            currentMargin
                                              .margin
                                              .realizedPnl ||
                                            0
                                          ) +
                                          (
                                            currentMargin
                                              .margin
                                              .unrealizedPnl ||
                                            0
                                          )
                                        ).toLocaleString(
                                          "en-IN"
                                        )}
                                      </Text>

                                    </>

                                  )}

                                </Stack>

                              </Paper>

                            )}

                            {/* ERROR */}
                            {currentMargin &&
                              !currentMargin.success && (

                                <Text
                                  size="xs"
                                  c="red"
                                  style={{
                                    maxWidth: 180,
                                  }}
                                >
                                  {currentMargin.error}
                                </Text>

                              )}

                          </Stack>

                        )}

                      </Table.Td>

                      {/* USER STATUS */}
                      <Table.Td>
                        <Badge
                          color={
                            broker.user_isactive
                              ? "green"
                              : "red"
                          }
                        >
                          {broker.user_isactive
                            ? "Active"
                            : "Inactive"}
                        </Badge>
                      </Table.Td>

                      {/* TOKENS */}
                      <Table.Td>
                        <Text fw={600}>
                          {broker.user_tokens ?? 0}
                        </Text>
                      </Table.Td>

                      {/* CREATED AT */}
                      <Table.Td>
                        {broker.broker_created_at
                          ? new Date(
                              broker.broker_created_at
                            ).toLocaleString()
                          : "-"}
                      </Table.Td>

                    </Table.Tr>
                  );
                })

              )}

            </Table.Tbody>

          </Table>

        </ScrollArea>

      </Stack>
    </Paper>
  );
};

export default Broker;
