import React, { useEffect, useRef, useState } from "react";
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
  Progress,
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
  IconPlayerStop,
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
 * Backtest page shared by every strategy (single date; config.dateRange = true adds a To date and per-day dropdowns).
 * Each strategy page passes a config:
 *   title, subtitle, endpoint
 *   stats(day, result)   -> [{ label, value, color?, sub? }]   tiles under the date
 *   tradeColumns         -> [{ header, align?, wrap?, render(t) }]  trades table (cells stay on one line unless wrap)
 *   extraPanels?(day, result) -> JSX                            strategy-specific sections
 *   defaultOptions?, OptionsForm?, optionsValid?  settings sent as body.options (strategies with settings)
 *   bottomPanels?(day, result) -> JSX                           shown at the very bottom of the result
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
      {leg.trails !== undefined ? (
        <Text size="sm" c="teal">
          Trail exits <b>{leg.trails}</b>
        </Text>
      ) : (
        <Text size="sm" c="teal">
          Targets <b>{leg.targets}</b>
        </Text>
      )}
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
      {leg.strikeChanges === undefined
        ? "Strikes traded"
        : `Strikes (${leg.strikeChanges} change${leg.strikeChanges === 1 ? "" : "s"})`}
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
// One day's stats, legs, P&L curve, trades and strategy panels (used by single-day and range views)
// --------------------------------------------------

const DayDetails = ({ day, result, config }) => (
  <Stack gap="lg" miw={0}>
    <SimpleGrid cols={{ base: 2, sm: 3, lg: 6 }} spacing="md">
      {config.stats(day, result).map((s) => (
        <Stat key={s.label} {...s} />
      ))}
    </SimpleGrid>

    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
      <LegCard name="CE" leg={day.ce} />
      <LegCard name="PE" leg={day.pe} />
    </SimpleGrid>

    {day.trades.length > 0 && (
      <Paper withBorder radius="md" p="md">
        <Text fw={600} mb="xs">
          Realized P&L through the day
        </Text>
        <PnlCurve trades={day.trades} />
      </Paper>
    )}

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

    {config.extraPanels?.(day, result)}
  </Stack>
);

/** Win rate etc. of ONE day, so the per-day tiles of a range run show that day and not the whole range. */
const dayResult = (day, result) => {
  const wins = day.trades.filter((t) => t.pnl > 0);
  const losses = day.trades.filter((t) => t.pnl <= 0);
  const avg = (a) => (a.length ? Math.round((a.reduce((x, t) => x + t.pnl, 0) / a.length) * 100) / 100 : 0);
  return {
    ...result,
    summary: {
      ...result.summary,
      winRatePct: day.trades.length ? Math.round((1000 * wins.length) / day.trades.length) / 10 : 0,
      avgWin: avg(wins),
      avgLoss: avg(losses),
    },
  };
};

/** Overall numbers of a multi-day run + each day as a collapsible row headed by its day P&L. */
const RangeResults = ({ result, config }) => {
  const sm = result.summary;
  const days = result.days || [];
  const tiles = sm
    ? [
        { label: "Net P&L", value: inr(sm.netPnl), color: pnlColor(sm.netPnl), sub: `avg ${inr(sm.avgPnlPerDay)} / day` },
        { label: "CE P&L", value: inr(sm.cePnl), color: pnlColor(sm.cePnl) },
        { label: "PE P&L", value: inr(sm.pePnl), color: pnlColor(sm.pePnl) },
        { label: "Days traded", value: sm.daysTraded, sub: `${sm.winDays} green · ${sm.lossDays} red · ${sm.flatDays} flat` },
        { label: "Trades", value: sm.totalTrades, sub: `${sm.winningTrades} won · ${sm.losingTrades} lost` },
        { label: "Win rate", value: `${sm.winRatePct}%`, sub: `avg win ${inr(sm.avgWin)} · avg loss ${inr(sm.avgLoss)}` },
        { label: "Profit factor", value: sm.profitFactor ?? "-" },
        { label: "Max drawdown", value: inr(sm.maxDrawdown), color: pnlColor(sm.maxDrawdown), sub: `worst losing streak ${sm.longestLosingStreakDays} day(s)` },
        { label: "Best day", value: inr(sm.bestDay.pnl), color: pnlColor(sm.bestDay.pnl), sub: dayjs(sm.bestDay.date).format("DD MMM") },
        { label: "Worst day", value: inr(sm.worstDay.pnl), color: pnlColor(sm.worstDay.pnl), sub: dayjs(sm.worstDay.date).format("DD MMM") },
      ]
    : [];

  return (
    <Stack gap="lg" miw={0}>
      {tiles.length > 0 && (
        <Paper withBorder radius="md" p="md">
          <Group justify="space-between" mb="sm">
            <Text fw={700} size="lg">
              Overall · {days[0]?.date && dayjs(days[0].date).format("DD MMM")} – {days.length && dayjs(days[days.length - 1].date).format("DD MMM YYYY")}
            </Text>
            <Text size="xs" c="dimmed">
              {result.meta?.apiCalls} Dhan calls · {result.meta?.durationSec}s
            </Text>
          </Group>
          <SimpleGrid cols={{ base: 2, sm: 3, lg: 5 }} spacing="md">
            {tiles.map((t) => (
              <Stat key={t.label} {...t} />
            ))}
          </SimpleGrid>
        </Paper>
      )}

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

      <Stack gap="xs" miw={0}>
        <Text fw={600}>Days ({days.length})</Text>
        <Accordion variant="separated" radius="md" chevronPosition="left">
          {days.map((d) =>
            d.status === "ok" ? (
              <Accordion.Item key={d.date} value={d.date}>
                <Accordion.Control>
                  <Group justify="space-between" wrap="nowrap" pr="sm">
                    <Group gap="xs">
                      <Text fw={600}>{dayjs(d.date).format("DD MMM YYYY, ddd")}</Text>
                      {d.expiryDay && (
                        <Badge color="violet" variant="light" size="sm">
                          Expiry
                        </Badge>
                      )}
                      <Text size="xs" c="dimmed">
                        {d.totalTrades} trade{d.totalTrades === 1 ? "" : "s"}
                      </Text>
                    </Group>
                    <Text fw={700} c={pnlColor(d.dayPnl)}>
                      {inr(d.dayPnl)}
                    </Text>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <DayDetails day={d} result={dayResult(d, result)} config={config} />
                </Accordion.Panel>
              </Accordion.Item>
            ) : (
              <Paper key={d.date} withBorder radius="md" px="md" py="sm">
                <Group justify="space-between" wrap="nowrap">
                  <Text fw={600} c="dimmed">
                    {dayjs(d.date).format("DD MMM YYYY, ddd")}
                  </Text>
                  <Group gap="xs">
                    <Text size="xs" c="dimmed">
                      {d.message}
                    </Text>
                    <Badge color={d.status === "holiday" ? "yellow" : "red"} variant="light">
                      {d.status}
                    </Badge>
                  </Group>
                </Group>
              </Paper>
            ),
          )}
        </Accordion>
      </Stack>

      {result.errors?.length > 0 && (
        <Accordion variant="separated" radius="md">
          <Accordion.Item value="errors">
            <Accordion.Control>
              <Text c="red">Errors ({result.errors.length})</Text>
            </Accordion.Control>
            <Accordion.Panel>
              <Code block>{JSON.stringify(result.errors, null, 2)}</Code>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      )}

      <Text size="xs" c="dimmed">
        Lot size {result.params?.lotSize} · gross P&L (no brokerage / taxes / slippage) · fills simulated from 1-minute bars.
      </Text>
    </Stack>
  );
};

const RangeProgress = ({ progress, onStop, stopping }) => {
  const total = progress?.total || 0;
  const done = progress?.done || 0;
  const pct = total ? Math.round((100 * done) / total) : 0;
  return (
    <Paper withBorder radius="md" p="md">
      <Group justify="space-between" mb="xs" wrap="nowrap">
        <Group gap="xs">
          <Loader size={16} />
          <Text fw={600}>
            {total ? `Day ${Math.min(done + 1, total)} of ${total}` : "Starting…"}
            {progress?.date ? ` · simulating ${dayjs(progress.date).format("DD MMM")}` : ""}
          </Text>
        </Group>
        <Button size="xs" variant="light" color="red" leftSection={<IconPlayerStop size={14} />} onClick={onStop} disabled={stopping}>
          {stopping ? "Stopping…" : "Stop"}
        </Button>
      </Group>
      <Progress value={pct} animated radius="xl" />
      <Text size="xs" c="dimmed" mt={6}>
        {done} of {total} days finished{progress?.elapsedSec ? ` · ${progress.elapsedSec}s` : ""}. Finished days appear below as they complete — you can open them while the rest runs.
      </Text>
    </Paper>
  );
};

// --------------------------------------------------
// Page
// --------------------------------------------------

const BacktestRunPage = ({ config }) => {
  const navigate = useNavigate();

  const [clientId, setClientId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [date, setDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const range = !!config.dateRange;
  // what the LAST run was: a date range (background job, day dropdowns) or one day (full day view)
  const [ranAsRange, setRanAsRange] = useState(false);
  const [progress, setProgress] = useState(null);
  const [stopped, setStopped] = useState(false);
  const [stopping, setStopping] = useState(false);
  const jobRef = useRef(null);
  const aliveRef = useRef(true);
  const [options, setOptions] = useState(config.defaultOptions || null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
  const minDate = dayjs().subtract(5, "year").add(1, "day").format("YYYY-MM-DD");
  const isWeekend = (d) => [0, 6].includes(dayjs(d).day());

  const optionsOk = !options || !config.optionsValid || config.optionsValid(options);
  const rangeOk = !range || !toDate || !dayjs(toDate).isBefore(dayjs(date), "day"); // no To date = one day
  const canRun = clientId.trim() && accessToken.trim() && date && rangeOk && optionsOk && !loading;

  // date range: start a background job, then poll it; finished days show up while the rest runs
  const runRange = async (day, last) => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const body = {
        clientId: clientId.trim(),
        accessToken: accessToken.trim(),
        fromDate: day,
        toDate: last,
        includeEvents: false,
        ...(options ? { options } : {}),
      };
    const started = await api.post(`${config.endpoint}/start`, body);
    const id = started.data.jobId;
    jobRef.current = id;
    let fails = 0;
    while (aliveRef.current) {
      await sleep(2000);
      let data;
      try {
        data = (await api.get(`/api/backtest/jobs/${id}`)).data;
        fails = 0;
      } catch (err) {
        // a few network hiccups are fine, a missing job or a long outage is not
        if (err.response?.status === 404 || ++fails >= 5) throw err;
        continue;
      }
      if (data.result) setResult(data.result);
      setProgress({ ...data.progress, elapsedSec: data.elapsedSec });
      if (data.status === "error") {
        throw { response: { status: data.error.status, data: { message: data.error.message, errors: data.error.errors, logs: data.error.logs } } };
      }
      if (data.status !== "running") {
        setStopped(data.status === "stopped");
        break;
      }
    }
    jobRef.current = null;
  };

  const stopRun = async () => {
    const id = jobRef.current;
    if (!id) return;
    setStopping(true);
    try {
      await api.post(`/api/backtest/jobs/${id}/cancel`);
    } catch {
      /* the poll will report it */
    }
  };

  // leaving the page stops the job, so it does not keep using Dhan calls for nobody
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      const id = jobRef.current;
      if (id) {
        const stop = (id) => api.post(`/api/backtest/jobs/${id}/cancel`);
        stop(id).catch(() => {});
      }
    };
  }, []);

  const runBacktest = async () => {
    const day = dayjs(date).format("YYYY-MM-DD");
    const last = range && toDate ? dayjs(toDate).format("YYYY-MM-DD") : day;
    const asRange = range && last !== day;
    setRanAsRange(asRange);
    setLoading(true);
    setError(null);
    setResult(null);
    setProgress(null);
    setStopped(false);
    setStopping(false);
    try {
      if (asRange) {
        await runRange(day, last);
        return;
      }
      // axios instance directly (not apiRequest): a 401 here means the DHAN token
      // is bad, it must not trigger the admin session refresh / logout
      const res = await api.post(config.endpoint, {
        clientId: clientId.trim(),
        accessToken: accessToken.trim(),
        fromDate: day,
        toDate: last,
        includeEvents: true,
        ...(options ? { options } : {}),
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
    <Box p="md" maw={1300} style={{ width: 0, minWidth: "100%" }}>
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
        <SimpleGrid cols={{ base: 1, sm: 2, lg: range ? 5 : 4 }} spacing="md">
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
            label={range ? "From date" : "Date"}
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
          {range && (
            <DateInput
              label="To date"
              placeholder="Pick a trading day"
              value={toDate}
              onChange={setToDate}
              valueFormat="DD MMM YYYY (ddd)"
              defaultDate={date || yesterday}
              minDate={date ? dayjs(date).format("YYYY-MM-DD") : minDate}
              maxDate={yesterday}
              excludeDate={isWeekend}
              clearable
            />
          )}
          <Button
            mt={{ base: 0, lg: 25 }}
            leftSection={loading ? <Loader size={16} color="white" /> : <IconPlayerPlay size={16} />}
            disabled={!canRun}
            onClick={runBacktest}
          >
            {loading ? "Running…" : "Run backtest"}
          </Button>
        </SimpleGrid>
        {config.OptionsForm && options && (
          <Box mt="md">
            <config.OptionsForm value={options} onChange={setOptions} disabled={loading} />
          </Box>
        )}
        <Text size="xs" c="dimmed" mt="sm">
          Weekdays up to yesterday{range ? ", up to 92 days per run; leave To date empty for one day with full details (candles, event timeline)" : ""}. Credentials are only sent to the backtest API for this run and are not saved.
        </Text>
      </Paper>

      {/* Loading */}
      {loading && !ranAsRange && (
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

      {loading && ranAsRange && (
        <Box mb="lg">
          <RangeProgress progress={progress} onStop={stopRun} stopping={stopping} />
        </Box>
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
      {!ranAsRange && result && day && day.status !== "ok" && (
        <Alert color={day.status === "holiday" ? "yellow" : "red"} radius="md" mb="lg" icon={<IconAlertCircle />} title={`${day.date} (${day.day}) — ${day.status}`}>
          {day.message}
        </Alert>
      )}
      {!ranAsRange && result && !day && (
        <Alert color="yellow" radius="md" mb="lg" icon={<IconAlertCircle />} title="No trading day in this selection">
          The selected date returned no data.
        </Alert>
      )}

      {/* Result */}
      {ranAsRange && stopped && !loading && (
        <Alert color="yellow" radius="md" mb="lg" icon={<IconAlertCircle />} title="Stopped">
          Showing the {result?.days?.length ?? 0} day(s) that finished before the run was stopped.
        </Alert>
      )}

      {ranAsRange && result && <RangeResults result={result} config={config} />}

      {!ranAsRange && result && day?.status === "ok" && (
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

          <DayDetails day={day} result={result} config={config} />

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

          {config.bottomPanels?.(day, result)}

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
