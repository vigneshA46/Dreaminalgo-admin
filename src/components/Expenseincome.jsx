import React, { useEffect, useMemo, useState } from "react";

import {
  Box,
  Paper,
  Text,
  Title,
  Group,
  Button,
  TextInput,
  Select,
  Modal,
  NumberInput,
  Textarea,
  Table,
  Badge,
  ActionIcon,
  Stack,
  Flex,
  Loader,
  Center,
  Divider,
  Card,
  SimpleGrid,
  ThemeIcon,
  Tabs,
  Pagination,
} from "@mantine/core";

import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconWallet,
  IconTrendingUp,
  IconTrendingDown,
  IconRefresh,
} from "@tabler/icons-react";

import { notifications } from "@mantine/notifications";

import { apiRequest } from "../../src/components/utils/api";


const Expenseincome = () => {

  /* =========================================================
     STATE
  ========================================================= */

  const [activeTab, setActiveTab] = useState("expense");

  const [records, setRecords] = useState([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  /*
    Default date range = last 30 days
  */

  const getDateString = (date) => {
    return date.toISOString().split("T")[0];
  };

  const getDefaultFromDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return getDateString(date);
  };

  const getTodayDate = () => {
    return getDateString(new Date());
  };

  const [fromDate, setFromDate] = useState(getDefaultFromDate());
  const [toDate, setToDate] = useState(getTodayDate());

  /*
    Applied dates

    These are separate from the date inputs so that
    data changes only after clicking Apply.
  */

  const [appliedFromDate, setAppliedFromDate] = useState(
    getDefaultFromDate()
  );

  const [appliedToDate, setAppliedToDate] = useState(
    getTodayDate()
  );

  /*
    Summary
  */

  const [summary, setSummary] = useState({
    total_expense: 0,
    total_income: 0,
    balance: 0,
  });

  /*
    Create / Edit modal
  */

  const [modalOpened, setModalOpened] = useState(false);

  const [editingRecord, setEditingRecord] = useState(null);

  const [form, setForm] = useState({
    date: getTodayDate(),
    type: "expense",
    amount: "",
    notes: "",
  });

  /*
    Delete
  */

  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /*
    Submit loading
  */

  const [submitLoading, setSubmitLoading] = useState(false);


  /* =========================================================
     FETCH DATA
  ========================================================= */

  const fetchExpensesIncome = async (
    customFromDate = appliedFromDate,
    customToDate = appliedToDate
  ) => {

    try {

      setLoading(true);

      const query = new URLSearchParams();

      if (customFromDate) {
        query.append("startDate", customFromDate);
      }

      if (customToDate) {
        query.append("endDate", customToDate);
      }

      /*
        We intentionally don't send type here.

        We fetch both expense and income once,
        then tabs filter them on the frontend.
      */

      const response = await apiRequest(
        "GET",
        `/api/expense-income?${query.toString()}`
      );

      console.log("Expense/Income Response:", response);

      setRecords(response?.data || []);

      setSummary(
        response?.summary || {
          total_expense: 0,
          total_income: 0,
          balance: 0,
        }
      );

    } catch (error) {

      console.error("Fetch Expense/Income Error:", error);

      notifications.show({
        title: "Failed to load data",
        message: error.message || "Unable to load expenses and income",
        color: "red",
      });

    } finally {

      setLoading(false);

    }
  };


  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {

    fetchExpensesIncome();

  }, []);


  /* =========================================================
     APPLY DATE FILTER
  ========================================================= */

  const handleApplyFilter = () => {

    if (!fromDate || !toDate) {

      notifications.show({
        title: "Missing dates",
        message: "Please select both From and To dates",
        color: "red",
      });

      return;
    }

    if (fromDate > toDate) {

      notifications.show({
        title: "Invalid date range",
        message: "From date cannot be after To date",
        color: "red",
      });

      return;
    }

    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);

    fetchExpensesIncome(fromDate, toDate);
  };


  /* =========================================================
     FILTER RECORDS BY TAB + SEARCH
  ========================================================= */

  const filteredRecords = useMemo(() => {

    return records.filter((record) => {

      /*
        Tab filter
      */

      if (record.type !== activeTab) {
        return false;
      }

      /*
        Search filter

        Searches:
        - notes
        - date
        - amount
      */

      if (search.trim()) {

        const searchValue = search.toLowerCase();

        const notes =
          record.notes?.toString().toLowerCase() || "";

        const date =
          record.date?.toString().toLowerCase() || "";

        const amount =
          record.amount?.toString().toLowerCase() || "";

        if (
          !notes.includes(searchValue) &&
          !date.includes(searchValue) &&
          !amount.includes(searchValue)
        ) {
          return false;
        }
      }

      return true;
    });

  }, [records, activeTab, search]);


  /* =========================================================
     TAB TOTAL
  ========================================================= */

  const currentTabTotal = useMemo(() => {

    return filteredRecords.reduce(
      (total, record) => total + Number(record.amount || 0),
      0
    );

  }, [filteredRecords]);


  /* =========================================================
     OPEN CREATE MODAL
  ========================================================= */

  const openCreateModal = () => {

    setEditingRecord(null);

    setForm({
      date: getTodayDate(),
      type: activeTab,
      amount: "",
      notes: "",
    });

    setModalOpened(true);
  };


  /* =========================================================
     OPEN EDIT MODAL
  ========================================================= */

  const openEditModal = (record) => {

    setEditingRecord(record);

    setForm({
      date: record.date
        ? record.date.split("T")[0]
        : getTodayDate(),

      type: record.type,

      amount: Number(record.amount || 0),

      notes: record.notes || "",
    });

    setModalOpened(true);
  };


  /* =========================================================
     HANDLE FORM CHANGE
  ========================================================= */

  const handleFormChange = (field, value) => {

    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

  };


  /* =========================================================
     CREATE / UPDATE
  ========================================================= */

  const handleSubmit = async () => {

    /*
      Validation
    */

    if (!form.date) {

      notifications.show({
        title: "Missing date",
        message: "Please select a date",
        color: "red",
      });

      return;
    }

    if (!form.type) {

      notifications.show({
        title: "Missing type",
        message: "Please select expense or income",
        color: "red",
      });

      return;
    }

    if (
      form.amount === "" ||
      form.amount === null ||
      Number(form.amount) <= 0
    ) {

      notifications.show({
        title: "Invalid amount",
        message: "Amount must be greater than 0",
        color: "red",
      });

      return;
    }

    try {

      setSubmitLoading(true);

      /*
        UPDATE
      */

      if (editingRecord) {

        const response = await apiRequest(
          "PATCH",
          `/api/expense-income/${editingRecord.id}`,
          {
            date: form.date,
            type: form.type,
            amount: Number(form.amount),
            notes: form.notes || null,
          }
        );

        console.log("Update Response:", response);

        notifications.show({
          title: "Updated",
          message: "Expense/Income updated successfully",
          color: "green",
        });

      }

      /*
        CREATE
      */

      else {

        const response = await apiRequest(
          "POST",
          "/api/expense-income",
          {
            date: form.date,
            type: form.type,
            amount: Number(form.amount),
            notes: form.notes || null,
          }
        );

        console.log("Create Response:", response);

        notifications.show({
          title: "Created",
          message: `${
            form.type === "expense"
              ? "Expense"
              : "Income"
          } created successfully`,
          color: "green",
        });

      }

      setModalOpened(false);

      setEditingRecord(null);

      await fetchExpensesIncome();

    } catch (error) {

      console.error("Create/Update Expense Error:", error);

      notifications.show({
        title: "Operation failed",
        message: error.message || "Something went wrong",
        color: "red",
      });

    } finally {

      setSubmitLoading(false);

    }
  };


  /* =========================================================
     OPEN DELETE CONFIRMATION
  ========================================================= */

  const openDeleteModal = (record) => {

    setRecordToDelete(record);

    setDeleteModalOpened(true);

  };


  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete = async () => {

    if (!recordToDelete) {
      return;
    }

    try {

      setDeleteLoading(true);

      await apiRequest(
        "DELETE",
        `/api/expense-income/${recordToDelete.id}`
      );

      notifications.show({
        title: "Deleted",
        message: "Expense/Income deleted successfully",
        color: "green",
      });

      setDeleteModalOpened(false);

      setRecordToDelete(null);

      await fetchExpensesIncome();

    } catch (error) {

      console.error("Delete Expense Error:", error);

      notifications.show({
        title: "Delete failed",
        message: error.message || "Unable to delete record",
        color: "red",
      });

    } finally {

      setDeleteLoading(false);

    }
  };


  /* =========================================================
     FORMAT CURRENCY
  ========================================================= */

  const formatAmount = (amount) => {

    return Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  };


  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate = (date) => {

    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  };


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <Box
      p="md"
      style={{
        width: "100%",
      }}
    >

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <Flex
        justify="space-between"
        align="center"
        mb="lg"
        wrap="wrap"
        gap="md"
      >

        <Box>

          <Title order={2}>
            Expense & Income
          </Title>

          <Text
            c="dimmed"
            size="sm"
            mt={4}
          >
            Manage your expenses and income
          </Text>

        </Box>

        <Button
          leftSection={<IconPlus size={18} />}
          onClick={openCreateModal}
        >
          Add {activeTab === "expense" ? "Expense" : "Income"}
        </Button>

      </Flex>


      {/* =====================================================
          DATE FILTER
      ===================================================== */}

      <Paper
        withBorder
        radius="md"
        p="md"
        mb="lg"
      >

        <Flex
          align="end"
          gap="md"
          wrap="wrap"
        >

          <TextInput
            label="From"
            type="date"
            value={fromDate}
            onChange={(event) =>
              setFromDate(event.currentTarget.value)
            }
            style={{
              minWidth: 180,
            }}
          />

          <TextInput
            label="To"
            type="date"
            value={toDate}
            onChange={(event) =>
              setToDate(event.currentTarget.value)
            }
            style={{
              minWidth: 180,
            }}
          />

          <Button
            onClick={handleApplyFilter}
            loading={loading}
          >
            Apply
          </Button>

          <ActionIcon
            variant="light"
            size="lg"
            onClick={() => fetchExpensesIncome()}
            title="Refresh"
          >
            <IconRefresh size={18} />
          </ActionIcon>

        </Flex>

      </Paper>


      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <SimpleGrid
        cols={{
          base: 1,
          sm: 3,
        }}
        mb="lg"
      >

        {/* Expense */}

        <Card
          withBorder
          radius="md"
          padding="lg"
        >

          <Group justify="space-between">

            <Box>

              <Text
                size="sm"
                c="dimmed"
              >
                Total Expense
              </Text>

              <Text
                fw={700}
                size="xl"
                mt={5}
              >
                ₹ {formatAmount(summary.total_expense)}
              </Text>

            </Box>

            <ThemeIcon
              size={45}
              radius="md"
              variant="light"
              color="red"
            >
              <IconTrendingDown size={23} />
            </ThemeIcon>

          </Group>

        </Card>


        {/* Income */}

        <Card
          withBorder
          radius="md"
          padding="lg"
        >

          <Group justify="space-between">

            <Box>

              <Text
                size="sm"
                c="dimmed"
              >
                Total Income
              </Text>

              <Text
                fw={700}
                size="xl"
                mt={5}
              >
                ₹ {formatAmount(summary.total_income)}
              </Text>

            </Box>

            <ThemeIcon
              size={45}
              radius="md"
              variant="light"
              color="green"
            >
              <IconTrendingUp size={23} />
            </ThemeIcon>

          </Group>

        </Card>


        {/* Balance */}

        <Card
          withBorder
          radius="md"
          padding="lg"
        >

          <Group justify="space-between">

            <Box>

              <Text
                size="sm"
                c="dimmed"
              >
                Balance
              </Text>

              <Text
                fw={700}
                size="xl"
                mt={5}
                c={
                  Number(summary.balance) >= 0
                    ? "green"
                    : "red"
                }
              >
                ₹ {formatAmount(summary.balance)}
              </Text>

            </Box>

            <ThemeIcon
              size={45}
              radius="md"
              variant="light"
            >
              <IconWallet size={23} />
            </ThemeIcon>

          </Group>

        </Card>

      </SimpleGrid>


      {/* =====================================================
          MAIN TABLE
      ===================================================== */}

      <Paper
        withBorder
        radius="md"
      >

        {/* Tabs + Search */}

        <Box p="md">

          <Flex
            justify="space-between"
            align="center"
            gap="md"
            wrap="wrap"
          >

            <Tabs
              value={activeTab}
              onChange={(value) => {

                setActiveTab(value || "expense");

                setSearch("");

              }}
            >

              <Tabs.List>

                <Tabs.Tab
                  value="expense"
                  leftSection={
                    <IconTrendingDown size={16} />
                  }
                >
                  Expenses
                </Tabs.Tab>

                <Tabs.Tab
                  value="income"
                  leftSection={
                    <IconTrendingUp size={16} />
                  }
                >
                  Income
                </Tabs.Tab>

              </Tabs.List>

            </Tabs>


            <TextInput
              placeholder={`Search ${activeTab}...`}
              leftSection={
                <IconSearch size={17} />
              }
              value={search}
              onChange={(event) =>
                setSearch(event.currentTarget.value)
              }
              style={{
                minWidth: 260,
              }}
            />

          </Flex>

          <Divider my="md" />

          <Flex
            justify="space-between"
            align="center"
          >

            <Text
              size="sm"
              c="dimmed"
            >
              Showing{" "}
              <Text
                span
                fw={600}
                c="dark"
              >
                {filteredRecords.length}
              </Text>{" "}
              {activeTab === "expense"
                ? "expenses"
                : "income records"}
            </Text>

            <Text
              fw={700}
              c={
                activeTab === "expense"
                  ? "red"
                  : "green"
              }
            >
              Total: ₹ {formatAmount(currentTabTotal)}
            </Text>

          </Flex>

        </Box>


        <Divider />


        {/* Table */}

        {loading ? (

          <Center p={60}>

            <Stack
              align="center"
              gap="sm"
            >

              <Loader />

              <Text
                size="sm"
                c="dimmed"
              >
                Loading records...
              </Text>

            </Stack>

          </Center>

        ) : filteredRecords.length === 0 ? (

          <Center p={60}>

            <Stack
              align="center"
              gap="xs"
            >

              <Text
                fw={600}
              >
                No {activeTab} found
              </Text>

              <Text
                size="sm"
                c="dimmed"
              >
                Try changing the date range or search.
              </Text>

            </Stack>

          </Center>

        ) : (

          <Box
            style={{
              overflowX: "auto",
            }}
          >

            <Table
              striped
              highlightOnHover
              verticalSpacing="md"
              withColumnBorders={false}
            >

              <Table.Thead>

                <Table.Tr>

                  <Table.Th>
                    Date
                  </Table.Th>

                  <Table.Th>
                    Type
                  </Table.Th>

                  <Table.Th>
                    Amount
                  </Table.Th>

                  <Table.Th>
                    Notes
                  </Table.Th>

                  <Table.Th
                    style={{
                      textAlign: "right",
                    }}
                  >
                    Actions
                  </Table.Th>

                </Table.Tr>

              </Table.Thead>


              <Table.Tbody>

                {filteredRecords.map((record) => (

                  <Table.Tr
                    key={record.id}
                  >

                    <Table.Td>

                      <Text
                        size="sm"
                        fw={500}
                      >
                        {formatDate(record.date)}
                      </Text>

                    </Table.Td>


                    <Table.Td>

                      <Badge
                        variant="light"
                        color={
                          record.type === "expense"
                            ? "red"
                            : "green"
                        }
                      >
                        {record.type === "expense"
                          ? "Expense"
                          : "Income"}
                      </Badge>

                    </Table.Td>


                    <Table.Td>

                      <Text
                        fw={600}
                        c={
                          record.type === "expense"
                            ? "red"
                            : "green"
                        }
                      >
                        ₹ {formatAmount(record.amount)}
                      </Text>

                    </Table.Td>


                    <Table.Td>

                      <Text
                        size="sm"
                        c={
                          record.notes
                            ? undefined
                            : "dimmed"
                        }
                        maw={350}
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {record.notes || "No notes"}
                      </Text>

                    </Table.Td>


                    <Table.Td>

                      <Group
                        justify="flex-end"
                        gap="xs"
                      >

                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() =>
                            openEditModal(record)
                          }
                          title="Edit"
                        >
                          <IconEdit size={17} />
                        </ActionIcon>

                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() =>
                            openDeleteModal(record)
                          }
                          title="Delete"
                        >
                          <IconTrash size={17} />
                        </ActionIcon>

                      </Group>

                    </Table.Td>

                  </Table.Tr>

                ))}

              </Table.Tbody>

            </Table>

          </Box>

        )}

      </Paper>


      {/* =====================================================
          CREATE / EDIT MODAL
      ===================================================== */}

      <Modal
        opened={modalOpened}
        onClose={() => {

          if (!submitLoading) {
            setModalOpened(false);
          }

        }}
        title={
          editingRecord
            ? "Edit Expense / Income"
            : `Add ${
                activeTab === "expense"
                  ? "Expense"
                  : "Income"
              }`
        }
        centered
      >

        <Stack gap="md">

          <TextInput
            label="Date"
            type="date"
            value={form.date}
            onChange={(event) =>
              handleFormChange(
                "date",
                event.currentTarget.value
              )
            }
            required
          />


          <Select
            label="Type"
            placeholder="Select type"
            data={[
              {
                value: "expense",
                label: "Expense",
              },
              {
                value: "income",
                label: "Income",
              },
            ]}
            value={form.type}
            onChange={(value) =>
              handleFormChange(
                "type",
                value
              )
            }
            required
          />


          <NumberInput
            label="Amount"
            placeholder="Enter amount"
            prefix="₹ "
            min={0}
            decimalScale={2}
            fixedDecimalScale={false}
            thousandSeparator=","
            value={form.amount}
            onChange={(value) =>
              handleFormChange(
                "amount",
                value
              )
            }
            required
          />


          <Textarea
            label="Notes"
            placeholder="Enter notes"
            minRows={4}
            autosize
            value={form.notes}
            onChange={(event) =>
              handleFormChange(
                "notes",
                event.currentTarget.value
              )
            }
          />


          <Group
            justify="flex-end"
            mt="sm"
          >

            <Button
              variant="default"
              onClick={() =>
                setModalOpened(false)
              }
              disabled={submitLoading}
            >
              Cancel
            </Button>

            <Button
              onClick={handleSubmit}
              loading={submitLoading}
            >
              {editingRecord
                ? "Update"
                : "Create"}
            </Button>

          </Group>

        </Stack>

      </Modal>


      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      <Modal
        opened={deleteModalOpened}
        onClose={() => {

          if (!deleteLoading) {
            setDeleteModalOpened(false);
          }

        }}
        title="Delete Expense / Income"
        centered
      >

        <Stack gap="md">

          <Text size="sm">

            Are you sure you want to delete this{" "}

            <Text
              span
              fw={600}
            >
              {recordToDelete?.type}
            </Text>

            ?

          </Text>


          {recordToDelete && (

            <Paper
              withBorder
              p="sm"
              radius="md"
            >

              <Group
                justify="space-between"
              >

                <Text
                  size="sm"
                  c="dimmed"
                >
                  {formatDate(
                    recordToDelete.date
                  )}
                </Text>

                <Text
                  fw={700}
                  c={
                    recordToDelete.type === "expense"
                      ? "red"
                      : "green"
                  }
                >
                  ₹{" "}
                  {formatAmount(
                    recordToDelete.amount
                  )}
                </Text>

              </Group>

              {recordToDelete.notes && (

                <Text
                  size="sm"
                  mt="xs"
                >
                  {recordToDelete.notes}
                </Text>

              )}

            </Paper>

          )}


          <Group
            justify="flex-end"
            mt="sm"
          >

            <Button
              variant="default"
              onClick={() =>
                setDeleteModalOpened(false)
              }
              disabled={deleteLoading}
            >
              Cancel
            </Button>

            <Button
              color="red"
              onClick={handleDelete}
              loading={deleteLoading}
            >
              Delete
            </Button>

          </Group>

        </Stack>

      </Modal>

    </Box>
  );
};


export default Expenseincome;
