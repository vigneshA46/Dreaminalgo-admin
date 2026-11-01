import React, { useState } from "react";
import {
  Accordion,
  Alert,
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  Code,
  Group,
  List,
  Loader,
  Paper,
  PasswordInput,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Timeline,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconArrowRight,
  IconPlayerPlay,
  IconRefresh,
  IconTarget,
  IconTrendingDown,
  IconTrendingUp,
  IconX,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { exitColor, inr, pnlColor } from "./backtestUtils";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";

/*
 * Single-date backtest page shared by every strategy.
 * Each strategy page passes a config:
 *   title, subtitle, endpoint
 *   stats(day, result)   -> [{ label, value, color?, sub? }]   tiles under the date
 *   tradeColumns         -> [{ header, align?, wrap?, render(t) }]  trades table (cells stay on one line unless wrap)
 *   extraPanels?(day, result) -> JSX                            strategy-specific sections
 */

const eventColor = {
  SELECT: "blue",
  ARM: "cyan",
  ROLL: "grape",
  ROLL_FAIL: "gray",
  ENTRY: "teal",
  EXIT: "orange",
  MTM: "red",
};

// --------------------------------------------------
// Reusable cells for trade tables
// --------------------------------------------------

export const SideBadge = ({ side }) => (
  <Badge color={side === "CE" ? "green" : "red"} variant="light" miw={44}>
    {side}
  </Badge>
);

export const PriceTime = ({ price, time }) => (
  <>
    <Text size="sm" fw={500}>
      {price}
    </Text>
    <Text size="xs" c="dimmed">
      {time}
    </Text>
  </>
);

export const ExitCell = ({ t }) => (
  <>
    <Badge color={exitColor[t.exitType] || "gray"} variant="light" mb={2}>
      {t.exitType}
    </Badge>
    <Text size="xs" c="dimmed">
      {t.exitReason}
    </Text>
  </>
);

const pivotOrder = ["S3", "S2", "S1", "P", "R1", "R2", "R3"];

/** Trades and P&L by the pivot each trade came from (summary.byPivot). */
export const PivotPnlPanel = ({ byPivot }) => {
  const rows = Object.entries(byPivot || {}).sort((a, b) => pivotOrder.indexOf(a[0]) - pivotOrder.indexOf(b[0]));
  if (!rows.length) return null;
  return (
    <Paper withBorder radius="md" p="md">
      <Text fw={600} mb="sm">
        P&L by pivot
      </Text>
      <Table verticalSpacing="xs" fz="sm" maw={420}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Pivot</Table.Th>
            <Table.Th ta="right">Trades</Table.Th>
            <Table.Th ta="right">P&L</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map(([k, v]) => (
            <Table.Tr key={k}>
              <Table.Td fw={600}>{k}</Table.Td>
              <Table.Td ta="right">{v.trades}</Table.Td>
              <Table.Td ta="right" fw={600} c={pnlColor(v.pnl)}>
                {inr(v.pnl)}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  );
};

// --------------------------------------------------
// Small pieces
// --------------------------------------------------

const Stat = ({ label, value, color, sub }) => (
  <Paper withBorder radius="md" p="md">
    <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
      {label}
    </Text>
    <Text size="xl" fw={700} c={color}>
      {value}
    </Text>
    {sub && (
      <Text size="xs" c="dimmed">
        {sub}
      </Text>
    )}
  </Paper>
);

const LegCard = ({ name, leg }) => (
  <Card withBorder radius="md" padding="md">
    <Group justify="space-between" mb="xs">
      <Group gap="xs">
        <Badge color={name === "CE" ? "green" : "red"} variant="filled">
          {name}
        </Badge>
        <Text fw={600}>{name === "CE" ? "Call leg" : "Put leg"}</Text>
      </Group>
      <Text fw={700} size="lg" c={pnlColor(leg.pnl)}>
        {inr(leg.pnl)}
      </Text>
    </Group>

    <Group gap="lg" mb="sm">
      <Text size="sm">
        Trades <b>{leg.trades}</b>
      </Text>
      <Text size="sm" c="teal">
        Targets <b>{leg.targets}</b>
      </Text>
      <Text size="sm" c="red">
        SL <b>{leg.stopLosses}</b>
      </Text>
      {leg.maxLot !== undefined && (
        <Text size="sm">
          Max lot <b>{leg.maxLot}</b>
        </Text>
      )}
    </Group>

    <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
      Strikes ({leg.strikeChanges} change{leg.strikeChanges === 1 ? "" : "s"})
    </Text>
    <Group gap={4} mb="sm">
      {leg.strikes.map((s, i) => (
        <Group key={i} gap={4} wrap="nowrap">
          {i > 0 && <IconArrowRight size={12} color="gray" />}
          <Badge variant="light" color={name === "CE" ? "green" : "red"} radius="sm">
            {s}
          </Badge>
        </Group>
      ))}
    </Group>

    {leg.firstPivots && (
      <>
        <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
          Pivots of first strike ({leg.strikes[0]})
        </Text>
        <Group gap={6}>
          {Object.entries(leg.firstPivots).map(([k, v]) => (
            <Badge key={k} variant="outline" color={k === "P" ? "blue" : k.startsWith("R") ? "teal" : "orange"} radius="sm">
              {k} {v}
            </Badge>
          ))}
        </Group>
      </>
    )}
  </Card>
);

/** Running P&L through the day (realized, stepped at each exit). */
const PnlCurve = ({ trades }) => {
  if (!trades.length) return null;
  const W = 760;
  const H = 180;
  const P = { l: 56, r: 12, t: 12, b: 24 };
  const toMin = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const x0 = toMin("09:15");
  const x1 = toMin("15:15");

  const series = { CE: [[x0, 0]], PE: [[x0, 0]], Total: [[x0, 0]] };
  const run = { CE: 0, PE: 0, Total: 0 };
  [...trades]
    .sort((a, b) => toMin(a.exitTime) - toMin(b.exitTime))
    .forEach((t) => {
      const x = toMin(t.exitTime);
      run[t.side] += t.pnl;
      run.Total += t.pnl;
      series[t.side].push([x, run[t.side]]);
      series.Total.push([x, run.Total]);
    });
  Object.keys(series).forEach((k) => series[k].push([x1, run[k]]));

  const ys = Object.values(series).flat().map((p) => p[1]);
  const yMin = Math.min(0, ...ys);
  const yMax = Math.max(0, ...ys);
  const pad = (yMax - yMin) * 0.08 || 1000;
  const lo = yMin - pad;
  const hi = yMax + pad;
  const sx = (x) => P.l + ((x - x0) / (x1 - x0)) * (W - P.l - P.r);
  const sy = (y) => P.t + (1 - (y - lo) / (hi - lo)) * (H - P.t - P.b);
  const step = (pts) =>
    pts
      .map((p, i) => (i === 0 ? `M${sx(p[0])},${sy(p[1])}` : `H${sx(p[0])}V${sy(p[1])}`))
      .join("");

  const ticks = ["09:15", "10:30", "11:45", "13:00", "14:15", "15:15"];
  const colors = { CE: "#2f9e44", PE: "#e03131", Total: "#1c7ed6" };

  return (
    <Box>
      <Group gap="md" mb={4}>
        {Object.keys(series).map((k) => (
          <Group key={k} gap={6}>
            <Box w={14} h={3} bg={colors[k]} />
            <Text size="xs" c="dimmed">
              {k} {inr(run[k])}
            </Text>
          </Group>
        ))}
      </Group>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        <line x1={P.l} x2={W - P.r} y1={sy(0)} y2={sy(0)} stroke="#adb5bd" strokeDasharray="4 4" />
        <text x={P.l - 6} y={sy(0) + 4} fontSize="11" textAnchor="end" fill="#868e96">
          ₹0
        </text>
        <text x={P.l - 6} y={sy(yMax) + 4} fontSize="11" textAnchor="end" fill="#868e96">
          {inr(yMax)}
        </text>
        {yMin < 0 && (
          <text x={P.l - 6} y={sy(yMin) + 4} fontSize="11" textAnchor="end" fill="#868e96">
            {inr(yMin)}
          </text>
        )}
        {ticks.map((t, i) => (
          <text
            key={t}
            x={sx(toMin(t))}
            y={H - 6}
            fontSize="11"
            textAnchor={i === 0 ? "start" : i === ticks.length - 1 ? "end" : "middle"}
            fill="#868e96"
          >
            {t}
          </text>
        ))}
        {["CE", "PE"].map((k) => (
          <path key={k} d={step(series[k])} fill="none" stroke={colors[k]} strokeWidth="1.5" strokeDasharray="5 3" />
        ))}
        <path d={step(series.Total)} fill="none" stroke={colors.Total} strokeWidth="2.5" />
      </svg>
    </Box>
  );
};

const LogLines = ({ logs }) => (
  <Stack gap={2}>
    {logs.map((l, i) => (
      <Text key={i} size="xs" ff="monospace" c={l.level === "error" ? "red" : l.level === "warn" ? "orange" : undefined}>
        {dayjs(l.time).format("HH:mm:ss")} [{l.level}] {l.date ? `${l.date} ` : ""}
        {l.message}
      </Text>
    ))}
  </Stack>
);

// --------------------------------------------------
// Page
// --------------------------------------------------

const BacktestRunPage = ({ config }) => {
  const navigate = useNavigate();

  const [clientId, setClientId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [date, setDate] = useState(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
  const minDate = dayjs().subtract(5, "year").add(1, "day").format("YYYY-MM-DD");
  const isWeekend = (d) => [0, 6].includes(dayjs(d).day());

  const canRun = clientId.trim() && accessToken.trim() && date && !loading;

  const runBacktest = async () => {
    const day = dayjs(date).format("YYYY-MM-DD");
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // axios instance directly (not apiRequest): a 401 here means the DHAN token
      // is bad, it must not trigger the admin session refresh / logout
      const res = await api.post(config.endpoint, {
        clientId: clientId.trim(),
        accessToken: accessToken.trim(),
        fromDate: day,
        toDate: day,
        includeEvents: true,
      });
      setResult(res.data);
    } catch (err) {
      const data = err.response?.data;
      setError({
        status: err.response?.status,
        message: data?.message || err.message || "Backtest request failed",
        errors: data?.errors || [],
        logs: data?.logs || [],
      });
      if (data?.days) setResult(data);
    } finally {
      setLoading(false);
    }
  };

  const day = result?.days?.find((d) => d.status === "ok") || result?.days?.[0];

  return (
    <Box p="md" maw={1300}>
      {/* Header */}
      <Anchor size="sm" onClick={() => navigate("/backtest")} mb="xs" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        <IconArrowLeft size={14} /> Backtest
      </Anchor>
      <Text size="xl" fw={700} style={{ wordBreak: "break-word" }}>
        {config.title}
      </Text>
      <Text size="sm" c="dimmed" mb="lg">
        {config.subtitle}
      </Text>

      {/* Inputs */}
      <Paper withBorder radius="md" p="md" mb="lg">
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
          <TextInput
            label="Dhan Client ID"
            placeholder="1100xxxxxx"
            value={clientId}
            onChange={(e) => setClientId(e.currentTarget.value)}
            required
          />
          <PasswordInput
            label="Dhan Access Token"
            placeholder="eyJ0eXAiOi..."
            value={accessToken}
            onChange={(e) => setAccessToken(e.currentTarget.value)}
            required
          />
          <DateInput
            label="Date"
            placeholder="Pick a trading day"
            value={date}
            onChange={setDate}
            valueFormat="DD MMM YYYY (ddd)"
            defaultDate={yesterday}
            minDate={minDate}
            maxDate={yesterday}
            excludeDate={isWeekend}
            required
            clearable
          />
          <Button
            mt={{ base: 0, lg: 25 }}
            leftSection={loading ? <Loader size={16} color="white" /> : <IconPlayerPlay size={16} />}
            disabled={!canRun}
            onClick={runBacktest}
          >
            {loading ? "Running…" : "Run backtest"}
          </Button>
        </SimpleGrid>
        <Text size="xs" c="dimmed" mt="sm">
          Weekdays up to yesterday. Credentials are only sent to the backtest API for this run and are not saved.
        </Text>
      </Paper>

      {/* Loading */}
      {loading && (
        <Paper withBorder radius="md" p="xl" mb="lg">
          <Stack align="center" gap="xs">
            <Loader />
            <Text fw={500}>Downloading option data from Dhan and simulating the day…</Text>
            <Text size="sm" c="dimmed">
              Usually 10–30 seconds (about 42–126 Dhan API calls)
            </Text>
          </Stack>
        </Paper>
      )}

      {/* Request error */}
      {error && (
        <Alert color="red" radius="md" mb="lg" icon={<IconAlertCircle />} title={`${error.status ? `HTTP ${error.status} — ` : ""}${error.message}`}>
          {error.errors.length > 0 && (
            <List size="sm" spacing={2}>
              {error.errors.map((e, i) => (
                <List.Item key={i}>
                  {typeof e === "string" ? e : `${e.date ? e.date + " · " : ""}${e.stage ? e.stage + ": " : ""}${e.message}`}
                  {e?.details?.errorMessage && (
                    <Text span size="xs" c="dimmed">
                      {" "}
                      (Dhan {e.details.errorCode}: {e.details.errorMessage})
                    </Text>
                  )}
                </List.Item>
              ))}
            </List>
          )}
          <Button mt="sm" size="xs" variant="light" color="red" leftSection={<IconRefresh size={14} />} onClick={runBacktest} disabled={!canRun}>
            Try again
          </Button>
        </Alert>
      )}

      {/* Day not traded (holiday / skipped / data error) */}
      {result && day && day.status !== "ok" && (
        <Alert color={day.status === "holiday" ? "yellow" : "red"} radius="md" mb="lg" icon={<IconAlertCircle />} title={`${day.date} (${day.day}) — ${day.status}`}>
          {day.message}
        </Alert>
      )}
      {result && !day && (
        <Alert color="yellow" radius="md" mb="lg" icon={<IconAlertCircle />} title="No trading day in this selection">
          The selected date returned no data.
        </Alert>
      )}

      {/* Result */}
      {result && day?.status === "ok" && (
        <Stack gap="lg">
          <Group justify="space-between">
            <Group gap="xs">
              <Text fw={700} size="lg">
                {dayjs(day.date).format("DD MMM YYYY, dddd")}
              </Text>
              {day.expiryDay && (
                <Badge color="violet" variant="filled">
                  Expiry day
                </Badge>
              )}
              <Badge color={day.closeReason.startsWith("MTM") ? "red" : "gray"} variant="light">
                Closed by {day.closeReason}
              </Badge>
            </Group>
            <Text size="xs" c="dimmed">
              {result.meta?.apiCalls} Dhan calls · {result.meta?.durationSec}s
            </Text>
          </Group>

          {/* Stats */}
          <SimpleGrid cols={{ base: 2, sm: 3, lg: 6 }} spacing="md">
            {config.stats(day, result).map((s) => (
              <Stat key={s.label} {...s} />
            ))}
          </SimpleGrid>

          {/* Legs */}
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            <LegCard name="CE" leg={day.ce} />
            <LegCard name="PE" leg={day.pe} />
          </SimpleGrid>

          {/* P&L curve */}
          {day.trades.length > 0 && (
            <Paper withBorder radius="md" p="md">
              <Text fw={600} mb="xs">
                Realized P&L through the day
              </Text>
              <PnlCurve trades={day.trades} />
            </Paper>
          )}

          {/* Trades */}
          <Paper withBorder radius="md" p="md">
            <Text fw={600} mb="sm">
              Trades ({day.trades.length})
            </Text>
            {day.trades.length === 0 ? (
              <Text size="sm" c="dimmed">
                No trades on this day.
              </Text>
            ) : (
              <Table.ScrollContainer minWidth={1100}>
                <Table striped highlightOnHover verticalSpacing="xs" fz="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>#</Table.Th>
                      {config.tradeColumns.map((c) => (
                        <Table.Th key={c.header} ta={c.align}>
                          {c.header}
                        </Table.Th>
                      ))}
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {day.trades.map((t, i) => (
                      <Table.Tr key={i}>
                        <Table.Td>{i + 1}</Table.Td>
                        {config.tradeColumns.map((c) => (
                          <Table.Td key={c.header} ta={c.align} style={c.wrap ? undefined : { whiteSpace: "nowrap" }}>
                            {c.render(t)}
                          </Table.Td>
                        ))}
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </Paper>

          {/* Strategy-specific sections */}
          {config.extraPanels?.(day, result)}

          {/* Analysis */}
          {result.analysis?.length > 0 && (
            <Paper withBorder radius="md" p="md">
              <Text fw={600} mb="sm">
                Analysis
              </Text>
              <List spacing={6} size="sm">
                {result.analysis.map((a, i) => (
                  <List.Item key={i}>{a}</List.Item>
                ))}
              </List>
            </Paper>
          )}

          {/* Timeline / errors / logs */}
          <Accordion variant="separated" radius="md" multiple>
            {day.events?.length > 0 && (
              <Accordion.Item value="events">
                <Accordion.Control>Event timeline ({day.events.length})</Accordion.Control>
                <Accordion.Panel>
                  <Timeline bulletSize={22} lineWidth={2}>
                    {day.events.map((e, i) => (
                      <Timeline.Item
                        key={i}
                        color={eventColor[e.type] || "gray"}
                        bullet={
                          e.type === "ENTRY" ? (
                            <IconTrendingUp size={12} />
                          ) : e.type === "EXIT" ? (
                            e.pnl >= 0 ? <IconTarget size={12} /> : <IconTrendingDown size={12} />
                          ) : e.type === "MTM" ? (
                            <IconX size={12} />
                          ) : null
                        }
                        title={
                          <Group gap={6}>
                            <Code>{e.time}</Code>
                            <Badge size="xs" variant="light" color={eventColor[e.type] || "gray"}>
                              {e.type}
                            </Badge>
                          </Group>
                        }
                      >
                        <Text size="sm">{e.message}</Text>
                        {e.type === "SELECT" && e.pivots && (
                          <Text size="xs" c="dimmed">
                            prev day H {e.prevDay?.high} · L {e.prevDay?.low} · C {e.prevDay?.close} ·{" "}
                            {Object.entries(e.pivots)
                              .map(([k, v]) => `${k} ${v}`)
                              .join(" | ")}
                          </Text>
                        )}
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Accordion.Panel>
              </Accordion.Item>
            )}

            {result.errors?.length > 0 && (
              <Accordion.Item value="errors">
                <Accordion.Control>
                  <Text c="red">Errors ({result.errors.length})</Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Code block>{JSON.stringify(result.errors, null, 2)}</Code>
                </Accordion.Panel>
              </Accordion.Item>
            )}

            <Accordion.Item value="logs">
              <Accordion.Control>Run logs ({result.logs?.length || 0})</Accordion.Control>
              <Accordion.Panel>
                <LogLines logs={result.logs || []} />
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>

          <Text size="xs" c="dimmed">
            Lot size {result.params?.lotSize} · gross P&L (no brokerage / taxes / slippage) · fills simulated from 1-minute bars.
          </Text>
        </Stack>
      )}

      {/* Logs for a failed request */}
      {error?.logs?.length > 0 && !result && (
        <Accordion variant="separated" radius="md">
          <Accordion.Item value="logs">
            <Accordion.Control>Run logs ({error.logs.length})</Accordion.Control>
            <Accordion.Panel>
              <LogLines logs={error.logs} />
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      )}
    </Box>
  );
};

export default BacktestRunPage;
