import { useEffect, useState } from "react";
import {
  Container,
  Title,
  Card,
  Stack,
  Group,
  Button,
  Text,
  Badge,
  Table,
  ScrollArea,
  FileInput,
  Loader,
  Divider,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import Papa from "papaparse";
import dayjs from "dayjs";
import { apiRequest } from "./utils/api";


export default function StockSelection() {
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [todayStocks, setTodayStocks] = useState([]);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [todayResponse, historyResponse] = await Promise.all([
        apiRequest("GET", "/api/stocks/today"),
        apiRequest("GET", "/api/stocks/history"),
      ]);

      setTodayStocks(todayResponse.stocks || []);
      setHistory(historyResponse.stocks || []);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: error.message,
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  const parseNumber = (value) =>
    Number(String(value || 0).replace(/,/g, ""));


  const handleFileUpload = (file) => {
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
    complete: (results) => {
      try {

      const cleanedRows = results.data.map((row) => {
      const cleaned = {};



      Object.keys(row).forEach((key) => {
        const cleanKey = key
          .replace(/\n/g, "")
          .trim();

        cleaned[cleanKey] = row[key];
      });

      return cleaned;
    });

/*     console.log(cleanedRows.length);
    console.log(cleanedRows.slice(0, 10));
 */

/*    console.table(
  cleanedRows
    .map(row => ({
      symbol: row["SYMBOL"],
      pct: Number(row["%CHNG"]),
      prev: Number(row["PREV. CLOSE"])
    }))
    .filter(row => row.pct > 1)
);
 */

/* 
    console.log("CLEANED ROW");
    console.log(cleanedRows[0]);

    console.log("PCT");
    console.log(cleanedRows[0]["%CHNG"]);

    console.log("PREV CLOSE");
    console.log(cleanedRows[0]["PREV. CLOSE"]);
    
    console.log("OUTPUT OF FILTER");

    console.table(
  cleanedRows
    .filter(row => Number(row["%CHNG"]) > 1)
    .slice(0, 20)
);
 */

const filteredStocks = cleanedRows
  .filter((row) => {
    const pctChng = parseNumber(row["%CHNG"]);
    const prevClose = parseNumber(row["PREV. CLOSE"]);

    return pctChng > 1 && prevClose > 1000;
  })
  .slice(0, 2)
  .map((row) => ({
    symbol: row["SYMBOL"],

    prev_close: parseNumber(row["PREV. CLOSE"]),
    iep: parseNumber(row["IEP"]),
    chng: parseNumber(row["CHNG"]),
    pct_chng: parseNumber(row["%CHNG"]),
    final_price: parseNumber(row["FINAL"]),
    final_quantity: parseNumber(row["FINAL QUANTITY"]),
    value_cr: parseNumber(row["VALUE (₹ Crores)"]),
    ffm_cap_cr: parseNumber(row["FFM CAP (₹ Crores)"]),
  }));

  console.log("MATCHES");
  console.table(filteredStocks);
  console.log("FILTERED");
  console.log(filteredStocks);

  setSelectedStocks(filteredStocks);

  notifications.show({
  title: "CSV Processed",
  message: `${filteredStocks.length} stocks selected`,
  color: "green",
    });

  } catch (error) {
    console.log(error);
  }
},

      error: (error) => {
        notifications.show({
          title: "CSV Parse Error",
          message: error.message,
          color: "red",
        });
      },
    });
  };

  

  const saveStocks = async () => {
    try {
      if (selectedStocks.length !== 2) {
        notifications.show({
          title: "Invalid Selection",
          message: "Exactly 2 stocks must be selected",
          color: "red",
        });

        return;
      }

      setSaving(true);

      await apiRequest(
        "POST",
        "/api/stocks/",
        {
          trade_date: dayjs().format("YYYY-MM-DD"),
          stocks: selectedStocks,
        }
      );

      notifications.show({
        title: "Success",
        message: "Stocks saved successfully",
        color: "green",
      });

      fetchData();
    } catch (error) {
      notifications.show({
        title: "Save Failed",
        message: error.message,
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container size="xl" py="lg">
      <Stack>

        <Title order={2}>
          Stock Option Strategy Selection
        </Title>

        <Card shadow="sm" withBorder>
          <Stack>

            <FileInput
              label="Upload NSE CSV"
              placeholder="Select CSV file"
              accept=".csv"
              onChange={handleFileUpload}
            />

            {selectedStocks.length > 0 && (
              <>
                <Divider />

                <Title order={4}>
                  Selected Stocks
                </Title>

                <Group align="stretch">
                  {selectedStocks.map((stock) => (
                    <Card
                      key={stock.symbol}
                      withBorder
                      style={{
                        flex: 1,
                        minWidth: 250,
                      }}
                    >
                      <Stack gap="xs">
                        <Text fw={700}>
                          {stock.symbol}
                        </Text>

                        <Badge color="green">
                          {stock.pct_chng}%
                        </Badge>

                        <Text size="sm">
                          Prev Close: ₹{stock.prev_close}
                        </Text>

                        <Text size="sm">
                          IEP: ₹{stock.iep}
                        </Text>
                      </Stack>
                    </Card>
                  ))}
                </Group>

                <Button
                  onClick={saveStocks}
                  loading={saving}
                >
                  Save Stocks
                </Button>
              </>
            )}
          </Stack>
        </Card>

        <Card shadow="sm" withBorder>
          <Stack>

            <Title order={4}>
              Today's Saved Stocks
            </Title>

            {loading ? (
              <Loader />
            ) : (
              <ScrollArea>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Symbol</Table.Th>
                      <Table.Th>% Change</Table.Th>
                      <Table.Th>IEP</Table.Th>
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody>
                    {todayStocks.map((stock) => (
                      <Table.Tr key={stock.id}>
                        <Table.Td>{stock.symbol}</Table.Td>
                        <Table.Td>{stock.pct_chng}</Table.Td>
                        <Table.Td>{stock.iep}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            )}

          </Stack>
        </Card>

        <Card shadow="sm" withBorder>
          <Stack>

            <Title order={4}>
              History
            </Title>

            {loading ? (
              <Loader />
            ) : (
              <ScrollArea>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Date</Table.Th>
                      <Table.Th>Symbol</Table.Th>
                      <Table.Th>% Change</Table.Th>
                      <Table.Th>IEP</Table.Th>
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody>
                    {history.map((stock) => (
                      <Table.Tr key={stock.id}>
                        <Table.Td>
                          {dayjs(stock.trade_date).format(
                            "DD-MM-YYYY"
                          )}
                        </Table.Td>

                        <Table.Td>
                          {stock.symbol}
                        </Table.Td>

                        <Table.Td>
                          {stock.pct_chng}
                        </Table.Td>

                        <Table.Td>
                          {stock.iep}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            )}

          </Stack>
        </Card>

      </Stack>
    </Container>
  );
}