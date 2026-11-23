import React from "react";
import { Badge, Group, Paper, SimpleGrid, Table, Tabs, Text } from "@mantine/core";
import BacktestRunPage, { ExitCell, PriceTime, SideBadge } from "./BacktestRunPage";
import { inr, pnlColor } from "./backtestUtils";

/** One option's levels for the day: buy side (traded) and sell side (reference). */
const LevelsTable = ({ side, L, trades }) => {
  const touched = Math.max(0, ...trades.filter((t) => t.side === side).map((t) => t.targetsHit));
  return (
    <Paper withBorder radius="md" p="md">
      <Group justify="space-between" mb="xs">
        <Group gap="xs">
          <SideBadge side={side} />
          <Text fw={600}>Levels</Text>
        </Group>
        <Text size="xs" c="dimmed">
          prev H {L.prevHigh} · L {L.prevLow} · open {L.open} · range {L.range}
        </Text>
      </Group>
      <Table verticalSpacing={4} fz="sm" withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>#</Table.Th>
            <Table.Th ta="right">Buy side</Table.Th>
            <Table.Th ta="right">Sell side (ref)</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <Table.Tr>
            <Table.Td fw={600}>Entry</Table.Td>
            <Table.Td ta="right" fw={700} c="blue">
              buy above {L.buyAbove}
            </Table.Td>
            <Table.Td ta="right" c="dimmed">
              sell below {L.sellBelow}
            </Table.Td>
          </Table.Tr>
          {L.buyTargets.map((v, i) => (
            <Table.Tr key={i}>
              <Table.Td>T{i + 1}</Table.Td>
              <Table.Td ta="right" c={i < touched ? "teal" : undefined} fw={i < touched ? 700 : undefined}>
                {v}
              </Table.Td>
              <Table.Td ta="right" c="dimmed">
                {L.sellTargets[i]}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      {touched > 0 && (
        <Text size="xs" c="teal" mt={6}>
          Highlighted: targets touched by a trade today (best T{touched})
        </Text>
      )}
    </Paper>
  );
};


/** The option's 5-min candles with the Supertrend (10, 3) value and trend, flips, and the trades on their candles. */
const SupertrendPanel = ({ supertrend, trades = [] }) => {
  if (!supertrend?.CE?.length) return null;
  const marks = (side, c) => {
    const out = [];
    for (const t of trades.filter((x) => x.side === side)) {
      if (t.entryTime === c.end) out.push({ key: `in${t.entryTime}`, color: "teal", text: `BUY @ ${t.entryPrice}` });
      if (t.exitTime === c.end) out.push({ key: `out${t.exitTime}${t.entryTime}`, color: pnlColor(t.pnl), text: `EXIT ${inr(t.pnl)}` });
    }
    return out;
  };
  return (
    <Paper withBorder radius="md" p="md">
      <Text fw={600} mb={2}>
        Supertrend (10, 3)
      </Text>
      <Text size="xs" c="dimmed" mb="sm">
        5-min candles of each option. The only exit is the trend turning from buy to sell on a candle close; the filled price is the next tick.
        {supertrend.warmup?.CE ? ` Warmed up on ${supertrend.warmup.CE.candles} (CE) / ${supertrend.warmup.PE?.candles ?? 0} (PE) previous-day candles.` : ""}
      </Text>
      <Tabs defaultValue="CE" keepMounted={false}>
        <Tabs.List mb="sm">
          {["CE", "PE"].map((s) => (
            <Tabs.Tab key={s} value={s}>
              {s}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {["CE", "PE"].map((s) => (
          <Tabs.Panel key={s} value={s}>
            <Table.ScrollContainer minWidth={640} mah={420}>
              <Table verticalSpacing={4} fz="sm" striped stickyHeader>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Candle</Table.Th>
                    <Table.Th ta="right">Open</Table.Th>
                    <Table.Th ta="right">High</Table.Th>
                    <Table.Th ta="right">Low</Table.Th>
                    <Table.Th ta="right">Close</Table.Th>
                    <Table.Th ta="right">Supertrend</Table.Th>
                    <Table.Th>Trend</Table.Th>
                    <Table.Th>Trades</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {supertrend[s].map((c) => {
                    const m = marks(s, c);
                    return (
                      <Table.Tr key={c.time} bg={c.flip || m.length ? "var(--mantine-color-yellow-0)" : undefined}>
                        <Table.Td style={{ whiteSpace: "nowrap" }}>
                          {c.time} – {c.end}
                        </Table.Td>
                        <Table.Td ta="right">{c.open}</Table.Td>
                        <Table.Td ta="right">{c.high}</Table.Td>
                        <Table.Td ta="right">{c.low}</Table.Td>
                        <Table.Td ta="right" fw={600}>
                          {c.close}
                        </Table.Td>
                        <Table.Td ta="right" c="dimmed">
                          {c.supertrend ?? "-"}
                        </Table.Td>
                        <Table.Td>
                          {c.trend ? (
                            <Badge size="xs" variant="light" color={c.trend === "buy" ? "teal" : "red"}>
                              {c.trend}
                              {c.flip ? ` · ${c.flip}` : ""}
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </Table.Td>
                        <Table.Td>
                          <Group gap={4} wrap="wrap">
                            {m.map((x) => (
                              <Badge key={x.key} size="xs" variant="light" color={x.color}>
                                {x.text}
                              </Badge>
                            ))}
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Tabs.Panel>
        ))}
      </Tabs>
    </Paper>
  );
};

const TargetsReachedPanel = ({ byTargetsHit }) => {
  const rows = Object.entries(byTargetsHit || {}).sort((a, b) => Number(a[0].slice(1)) - Number(b[0].slice(1)));
  if (!rows.length) return null;
  return (
    <Paper withBorder radius="md" p="md">
      <Text fw={600} mb="sm">
        P&L by highest target reached
      </Text>
      <Table verticalSpacing="xs" fz="sm" maw={420}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Reached</Table.Th>
            <Table.Th ta="right">Trades</Table.Th>
            <Table.Th ta="right">P&L</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map(([k, v]) => (
            <Table.Tr key={k}>
              <Table.Td fw={600}>{k === "T0" ? "No target touched" : k}</Table.Td>
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

const config = {
  title: "nifty_option_level_breakout",
  subtitle:
    "ATM from NIFTY 09:15 close. range = prev-day (H − L) × 26.11%, buy above = open + range, T1–T11 every range. " +
    "5-min close above buy above → buy 1 lot. The only exit is the Supertrend (10, 3) of the option's 5-min chart turning sell (square off 15:14).",
  endpoint: "/api/backtest/nifty_option_level_breakout",

  stats: (day, result) => [
    { label: "Day P&L", value: inr(day.dayPnl), color: pnlColor(day.dayPnl) },
    { label: "CE P&L", value: inr(day.ce.pnl), color: pnlColor(day.ce.pnl) },
    { label: "PE P&L", value: inr(day.pe.pnl), color: pnlColor(day.pe.pnl) },
    { label: "Trades", value: day.totalTrades, sub: `${day.trails} Supertrend exit${day.trails === 1 ? "" : "s"}` },
    {
      label: "Win rate",
      value: `${result.summary?.winRatePct ?? 0}%`,
      sub: `avg win ${inr(result.summary?.avgWin)} · avg loss ${inr(result.summary?.avgLoss)}`,
    },
    { label: "ATM strike", value: day.atmStrike ?? "-", sub: `NIFTY ${day.niftyAtSelect ?? "-"} at 09:15 close` },
  ],

  tradeColumns: [
    { header: "Side", render: (t) => <SideBadge side={t.side} /> },
    { header: "Strike", render: (t) => <Text size="sm" fw={600}>{t.strike}</Text> },
    { header: "Entry", render: (t) => <PriceTime price={t.entryPrice} time={t.entryTime} /> },
    { header: "Exit", render: (t) => <PriceTime price={t.exitPrice} time={t.exitTime} /> },
    { header: "Buy above", render: (t) => t.buyAbove },
    {
      header: "Supertrend",
      render: (t) => (
        <>
          <Text size="xs">
            entry: {t.supertrendAtEntry ? `${t.supertrendAtEntry.trend} ${t.supertrendAtEntry.value}` : "-"}
          </Text>
          <Text size="xs" c="dimmed">
            exit: {t.supertrendAtExit ? `${t.supertrendAtExit.trend} ${t.supertrendAtExit.value}` : "-"}
          </Text>
        </>
      ),
    },
    {
      header: "Targets hit",
      render: (t) => (
        <Badge variant="light" color={t.targetsHit > 0 ? "teal" : "gray"}>
          {t.targetsHit > 0 ? `T${t.targetsHit}` : "none"}
        </Badge>
      ),
    },
    { header: "Exit type", wrap: true, render: (t) => <ExitCell t={t} /> },
    { header: "Points", align: "right", render: (t) => <Text size="sm" c={pnlColor(t.points)}>{t.points}</Text> },
    { header: "P&L", align: "right", render: (t) => <Text size="sm" fw={700} c={pnlColor(t.pnl)}>{inr(t.pnl)}</Text> },
    { header: "Side P&L", align: "right", render: (t) => <Text size="sm" c={pnlColor(t.sidePnlAfter)}>{inr(t.sidePnlAfter)}</Text> },
  ],

  extraPanels: (day, result) => (
    <>
      {day.levels?.CE && day.levels?.PE && (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <LevelsTable side="CE" L={day.levels.CE} trades={day.trades} />
          <LevelsTable side="PE" L={day.levels.PE} trades={day.trades} />
        </SimpleGrid>
      )}
      <SupertrendPanel supertrend={day.supertrend} trades={day.trades} />
      <TargetsReachedPanel byTargetsHit={result.summary?.byTargetsHit} />
    </>
  ),
};

const BacktestLevelBreakout = () => <BacktestRunPage config={config} />;

export default BacktestLevelBreakout;
