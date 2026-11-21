import React from "react";
import { Badge, Group, Paper, SimpleGrid, Table, Tabs, Text } from "@mantine/core";
import { inr, pnlColor } from "./backtestUtils";

/** Strike picked for each side at 09:30. */
export const BearishSelectionPanel = ({ selection }) => {
  if (!selection?.CE || !selection?.PE) return null;
  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
      {["CE", "PE"].map((side) => (
        <Paper key={side} withBorder radius="md" p="md">
          <Group gap="xs" mb={4}>
            <Badge color={side === "CE" ? "green" : "red"} variant="filled">
              {side}
            </Badge>
            <Text fw={600}>Strike {selection[side].strike}</Text>
          </Group>
          <Text size="sm">
            Price at {selection[side].time}: <b>{selection[side].price}</b>
          </Text>
          <Text size="xs" c="dimmed">
            {selection[side].rule}
          </Text>
        </Paper>
      ))}
    </SimpleGrid>
  );
};

// Mantine badges cut long labels with "…"; these show the full text
const FULL = { root: { maxWidth: "none" }, label: { overflow: "visible", textOverflow: "clip" } };

const Cell = ({ children, ...p }) => (
  <Table.Td ta="right" {...p}>
    {children}
  </Table.Td>
);

const Candles15 = ({ candles, trades }) => {
  const marks = (c) => {
    const out = [];
    for (const t of trades) {
      if (t.bearishCandle?.start === c.time) out.push({ key: `m${t.entryTime}`, color: "grape", text: `MARK H ${t.markedHigh}` });
      if (t.entryTime >= c.time && t.entryTime < c.end) out.push({ key: `in${t.entryTime}`, color: "teal", text: `BUY @ ${t.entryPrice} · SL ${t.initialSl}` });
      if (t.exitTime >= c.time && t.exitTime < c.end) out.push({ key: `out${t.exitTime}${t.entryTime}`, color: pnlColor(t.pnl), text: `EXIT ${inr(t.pnl)}` });
    }
    return out;
  };
  return (
    <Table.ScrollContainer minWidth={640} mah={420}>
      <Table verticalSpacing={4} fz="sm" striped stickyHeader>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>15-min candle</Table.Th>
            <Table.Th ta="right">Open</Table.Th>
            <Table.Th ta="right">High</Table.Th>
            <Table.Th ta="right">Low</Table.Th>
            <Table.Th ta="right">Close</Table.Th>
            <Table.Th>Type</Table.Th>
            <Table.Th>Trades</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {candles.map((c) => {
            const m = marks(c);
            return (
              <Table.Tr key={c.time} bg={m.length ? "var(--mantine-color-yellow-0)" : undefined}>
                <Table.Td style={{ whiteSpace: "nowrap" }}>
                  {c.time} – {c.end}
                  {c.partial ? " (to 15:14)" : ""}
                </Table.Td>
                <Cell>{c.open}</Cell>
                <Cell>{c.high}</Cell>
                <Cell>{c.low}</Cell>
                <Cell fw={600} c={c.bearish ? "red" : "teal"}>
                  {c.close}
                </Cell>
                <Table.Td>
                  <Badge styles={FULL} size="xs" variant="light" color={c.bearish ? "red" : "teal"}>
                    {c.bearish ? "bearish" : "bullish"}
                  </Badge>
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
  );
};

const HaCandles = ({ candles, trades }) => {
  // the stop each Heikin Ashi candle set (while a trade was open)
  const stops = (c) => {
    const out = [];
    for (const t of trades) {
      for (const mv of t.slMoves || []) if (mv.candle === c.time) out.push({ key: `s${t.entryTime}${mv.time}`, text: `stop → ${mv.sl}` });
    }
    return out;
  };
  return (
    <Table.ScrollContainer minWidth={640} mah={420}>
      <Table verticalSpacing={4} fz="sm" striped stickyHeader>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>5-min candle</Table.Th>
            <Table.Th ta="right">HA open</Table.Th>
            <Table.Th ta="right">HA high</Table.Th>
            <Table.Th ta="right">HA low</Table.Th>
            <Table.Th ta="right">HA close</Table.Th>
            <Table.Th>Trailing stop</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {candles.map((c) => {
            const s = stops(c);
            return (
              <Table.Tr key={c.time} bg={s.length ? "var(--mantine-color-yellow-0)" : undefined}>
                <Table.Td style={{ whiteSpace: "nowrap" }}>
                  {c.time} – {c.end}
                </Table.Td>
                <Cell>{c.open}</Cell>
                <Cell>{c.high}</Cell>
                <Cell fw={600}>{c.low}</Cell>
                <Cell c={c.close >= c.open ? "teal" : "red"}>{c.close}</Cell>
                <Table.Td>
                  {s.map((x) => (
                    <Badge key={x.key} size="xs" variant="light" color="orange">
                      {x.text}
                    </Badge>
                  ))}
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
};

/** The candles each option was traded on: 15-min (entry) and 5-min Heikin Ashi (trailing stop). */
export const BearishCandlesPanel = ({ legCandles, trades = [] }) => {
  if (!legCandles?.CE) return null;
  return (
    <Paper withBorder radius="md" p="md">
      <Text fw={600} mb={2}>
        Candles used
      </Text>
      <Text size="xs" c="dimmed" mb="sm">
        15-min candles of the option from 09:15 (bearish = close below open) and 5-min Heikin Ashi candles (seeded from 09:15). Highlighted rows hold a mark, an entry, an exit or a stop move.
      </Text>
      <Tabs defaultValue="CE" keepMounted={false}>
        <Tabs.List mb="sm">
          {["CE", "PE"].map((s) => (
            <Tabs.Tab key={s} value={s}>
              {s} {legCandles[s].strike}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {["CE", "PE"].map((s) => {
          const t = trades.filter((x) => x.side === s);
          return (
            <Tabs.Panel key={s} value={s}>
              <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
                <Candles15 candles={legCandles[s].candles15} trades={t} />
                <HaCandles candles={legCandles[s].ha5} trades={t} />
              </SimpleGrid>
            </Tabs.Panel>
          );
        })}
      </Tabs>
    </Paper>
  );
};
