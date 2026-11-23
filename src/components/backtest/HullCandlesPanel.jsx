import React from "react";
import { Badge, Group, Paper, Table, Text } from "@mantine/core";
import { inr, pnlColor } from "./backtestUtils";

/** The day's NIFTY candles with the Hull MA value and colour, the starting colour and each trade on its signal candle. */
export const HullCandlesPanel = ({ candles, trades = [], timeframe, warmup }) => {
  if (!candles?.length) return null;
  const marks = (c) => {
    const out = [];
    for (const t of trades) {
      if (t.entryTime === c.end) out.push({ key: `in${t.entryTime}`, color: t.side === "CE" ? "green" : "red", text: `BUY ${t.side} ${t.strike} @ ${t.entryPrice}` });
      if (t.exitTime === c.end) out.push({ key: `out${t.exitTime}${t.entryTime}`, color: pnlColor(t.pnl), text: `EXIT ${t.side} ${inr(t.pnl)}` });
    }
    return out;
  };
  return (
    <Paper withBorder radius="md" p="md">
      <Group justify="space-between" mb="sm">
        <Text fw={600}>
          NIFTY {timeframe}-min candles · Hull MA 24 ({candles.length})
        </Text>
        <Text size="xs" c="dimmed">
          colour: green = Hull MA above the previous candle's value, red = not · the signal is read at the candle close
          {warmup ? ` · ${warmup.historyCandles} candles of previous days feed the indicator` : ""}
        </Text>
      </Group>
      <Table.ScrollContainer minWidth={680} mah={520}>
        <Table verticalSpacing={4} fz="sm" striped stickyHeader highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Candle</Table.Th>
              <Table.Th ta="right">Open</Table.Th>
              <Table.Th ta="right">High</Table.Th>
              <Table.Th ta="right">Low</Table.Th>
              <Table.Th ta="right">Close</Table.Th>
              <Table.Th ta="right">Hull MA</Table.Th>
              <Table.Th>Colour</Table.Th>
              <Table.Th>Signal / trades</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {candles.map((c) => {
              const m = marks(c);
              return (
                <Table.Tr key={c.time} bg={c.signal || m.length ? "var(--mantine-color-yellow-0)" : undefined}>
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
                    {c.hma ?? "-"}
                  </Table.Td>
                  <Table.Td>
                    {c.color ? (
                      <Badge size="xs" variant="light" color={c.color === "green" ? "teal" : "red"}>
                        {c.color}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4} wrap="wrap">
                      {c.signal && (
                        <Badge size="xs" variant="filled" color={c.signal === "START" ? "gray" : c.signal === "BUY CE" ? "teal" : "red"}>
                          {c.signal === "START" ? "starting colour" : c.signal}
                        </Badge>
                      )}
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
