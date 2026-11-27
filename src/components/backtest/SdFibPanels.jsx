import React from "react";
import { Badge, Group, Paper, SimpleGrid, Table, Tabs, Text } from "@mantine/core";
import { SideBadge } from "./BacktestRunPage";
import { inr, pnlColor } from "./backtestUtils";

/** The day's volatility numbers (sheet method) and the 15 levels of each option; only BUY ABOVE trades. */
export const SdLevelsPanel = ({ day }) => {
  const v = day.volatility;
  if (!v || !day.levels?.CE) return null;
  const sides = ["CE", "PE"];
  return (
    <Paper withBorder radius="md" p="md">
      <Group justify="space-between" mb="xs" wrap="wrap">
        <Text fw={600}>Volatility and levels</Text>
        <Text size="xs" c="dimmed">
          ATM {day.atmStrike} (NIFTY 09:15 close {day.niftyAtSelect}) · {v.dailyCloses} daily closes → {v.values} log values
        </Text>
      </Group>
      <Text size="sm" mb="sm">
        average {v.average} + 1 × stdev {v.stdev} = daily volatility {v.dailyVolPct}% → option volatility <b>{v.optionVol}</b> ({Math.round(v.optionVol * 100)}%)
      </Text>
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {sides.map((s) => {
          const L = day.levels[s];
          return (
            <div key={s}>
              <Group gap="xs" mb={4}>
                <SideBadge side={s} />
                <Text size="xs" c="dimmed">
                  base (09:15 open) {L.base} · 1SD range {L.oneSd} · tick trigger {L.trigger}
                </Text>
              </Group>
              <Table verticalSpacing={3} fz="sm" withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Level</Table.Th>
                    <Table.Th ta="right">Factor</Table.Th>
                    <Table.Th ta="right">Fib range</Table.Th>
                    <Table.Th ta="right">Price</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {L.rows.map((r) => (
                    <Table.Tr key={r.name} bg={r.traded ? "var(--mantine-color-blue-0)" : undefined}>
                      <Table.Td fw={r.traded ? 700 : undefined}>
                        {r.name}
                        {r.traded && (
                          <Badge ml={6} size="xs" variant="light">
                            traded
                          </Badge>
                        )}
                      </Table.Td>
                      <Table.Td ta="right">{r.factor}</Table.Td>
                      <Table.Td ta="right">{r.fibRange}</Table.Td>
                      <Table.Td ta="right" fw={r.traded ? 700 : undefined} c={r.traded ? "blue" : undefined}>
                        {r.price}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </div>
          );
        })}
      </SimpleGrid>
    </Paper>
  );
};

/** The options' 5-min candles with the Supertrend value and trend, flips, and the trades on their candles. */
export const SdSupertrendPanel = ({ supertrend, trades = [] }) => {
  if (!supertrend?.CE?.length) return null;
  const marks = (side, c) => {
    const out = [];
    for (const t of trades.filter((x) => x.side === side)) {
      if (t.entryTime === c.end) out.push({ key: `in${t.entryTime}`, color: "teal", text: `BUY ${t.entryType?.toLowerCase() || ""} @ ${t.entryPrice}` });
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
        5-min candles of each option. Entries need the trend on buy; the exit is the trend turning sell on a candle close (filled at the next tick).
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
