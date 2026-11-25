import React from "react";
import { Badge, Group, Paper, Table, Text } from "@mantine/core";
import { inr, pnlColor } from "./backtestUtils";

/** The day's NIFTY candles with EMA 5 / EMA 10, crossovers, setup steps and the trades on their candles. */
export const EmaCandlesPanel = ({ candles, trades = [], timeframe, warmup }) => {
  if (!candles?.length) return null;
  const withSt = candles.some((c) => c.supertrend !== undefined);
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
          NIFTY {timeframe}-min candles · EMA 5 / EMA 10{withSt ? " / Supertrend (10, 1.5)" : ""} ({candles.length})
        </Text>
        <Text size="xs" c="dimmed">
          signals are read at the candle close, entries are filled at the next option tick
          {warmup ? ` · ${warmup.historyCandles} candles of previous days feed the EMAs` : ""}
        </Text>
      </Group>
      <Table.ScrollContainer minWidth={760} mah={520}>
        <Table verticalSpacing={4} fz="sm" striped stickyHeader highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Candle</Table.Th>
              <Table.Th ta="right">Open</Table.Th>
              <Table.Th ta="right">High</Table.Th>
              <Table.Th ta="right">Low</Table.Th>
              <Table.Th ta="right">Close</Table.Th>
              <Table.Th ta="right">EMA 5</Table.Th>
              <Table.Th ta="right">EMA 10</Table.Th>
              {withSt && <Table.Th>Supertrend</Table.Th>}
              <Table.Th>Signal / trades</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {candles.map((c) => {
              const m = marks(c);
              return (
                <Table.Tr key={c.time} bg={c.cross || c.setup || c.stFlip || m.length ? "var(--mantine-color-yellow-0)" : undefined}>
                  <Table.Td style={{ whiteSpace: "nowrap" }}>
                    {c.time} – {c.end}
                  </Table.Td>
                  <Table.Td ta="right">{c.open}</Table.Td>
                  <Table.Td ta="right">{c.high}</Table.Td>
                  <Table.Td ta="right">{c.low}</Table.Td>
                  <Table.Td ta="right" fw={600}>
                    {c.close}
                  </Table.Td>
                  <Table.Td ta="right" c={c.ema5 >= c.ema10 ? "teal" : "red"}>
                    {c.ema5}
                  </Table.Td>
                  <Table.Td ta="right" c="dimmed">
                    {c.ema10}
                  </Table.Td>
                  {withSt && (
                    <Table.Td style={{ whiteSpace: "nowrap" }}>
                      {c.trend ? (
                        <Badge size="xs" variant="light" color={c.trend === "buy" ? "teal" : "red"}>
                          {c.trend} {c.supertrend}
                          {c.stFlip ? ` · ${c.stFlip}` : ""}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </Table.Td>
                  )}
                  <Table.Td>
                    <Group gap={4} wrap="wrap">
                      {c.cross && (
                        <Badge size="xs" variant="filled" color={c.cross.includes("above") ? "teal" : "red"}>
                          cross: {c.cross.replace("EMA5 ", "")}
                        </Badge>
                      )}
                      {c.setup && (
                        <Badge size="xs" variant="light" color="grape">
                          {c.setup === "confirmed" ? "close confirmed" : c.setup === "retest" ? "EMA 5 retest" : c.setup === "rejection" ? "Supertrend rejection" : "Supertrend against"}
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
