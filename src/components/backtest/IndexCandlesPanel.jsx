import React from "react";
import { Badge, Group, Paper, Table, Text } from "@mantine/core";
import { inr, pnlColor } from "./backtestUtils";

/** The day's NIFTY candles of the entry timeframe, with the trades entered / exited on each. */
export const IndexCandlesPanel = ({ candles, trades = [], timeframe }) => {
  if (!candles?.length) return null;

  // a trade's signal candle ends at its entry time; an exit belongs to the candle it happened in
  const marks = (c) => {
    const out = [];
    for (const t of trades) {
      if (t.entryTime === c.end) out.push({ key: `in${t.entryTime}${t.side}`, color: t.side === "CE" ? "green" : "red", text: `BUY ${t.side} ${t.strike}` });
      if (t.exitTime > c.time && t.exitTime <= c.end) {
        out.push({ key: `out${t.exitTime}${t.side}${t.entryTime}`, color: pnlColor(t.pnl), text: `EXIT ${t.side} ${inr(t.pnl)}` });
      }
    }
    return out;
  };

  return (
    <Paper withBorder radius="md" p="md">
      <Group justify="space-between" mb="sm">
        <Text fw={600}>
          NIFTY {timeframe}-min candles ({candles.length})
        </Text>
        <Text size="xs" c="dimmed">
          avg = (O + H + L + C) / 4 · signal = the candle a trade was entered on
        </Text>
      </Group>
      <Table.ScrollContainer minWidth={640} mah={520}>
        <Table verticalSpacing={4} fz="sm" striped stickyHeader highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Time</Table.Th>
              <Table.Th ta="right">Open</Table.Th>
              <Table.Th ta="right">High</Table.Th>
              <Table.Th ta="right">Low</Table.Th>
              <Table.Th ta="right">Close</Table.Th>
              <Table.Th ta="right">Avg</Table.Th>
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
                  </Table.Td>
                  <Table.Td ta="right">{c.open}</Table.Td>
                  <Table.Td ta="right">{c.high}</Table.Td>
                  <Table.Td ta="right">{c.low}</Table.Td>
                  <Table.Td ta="right" fw={600} c={c.close >= c.open ? "teal" : "red"}>
                    {c.close}
                  </Table.Td>
                  <Table.Td ta="right" c="dimmed">
                    {c.avg}
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4} wrap="nowrap">
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
    </Paper>
  );
};
