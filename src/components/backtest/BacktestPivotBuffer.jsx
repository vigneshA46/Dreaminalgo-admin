import React from "react";
import { Paper, Table, Text } from "@mantine/core";
import BacktestRunPage, { ExitCell, PriceTime, SideBadge } from "./BacktestRunPage";
import { inr, pnlColor } from "./backtestUtils";

const pivotOrder = ["S3", "S2", "S1", "P", "R1", "R2", "R3"];

const config = {
  title: "nifty_option_pivot_buffer",
  subtitle: "Pivot touch → entry at pivot + 25% of the gap to the next pivot, target entry + 30% of the gap, SL back at the pivot. 1 lot, all tick based.",
  endpoint: "/api/backtest/nifty_option_pivot_buffer",

  stats: (day, result) => [
    { label: "Day P&L", value: inr(day.dayPnl), color: pnlColor(day.dayPnl) },
    { label: "CE P&L", value: inr(day.ce.pnl), color: pnlColor(day.ce.pnl) },
    { label: "PE P&L", value: inr(day.pe.pnl), color: pnlColor(day.pe.pnl) },
    { label: "Trades", value: day.totalTrades, sub: `${day.targets} target · ${day.stopLosses} SL` },
    {
      label: "Win rate",
      value: `${result.summary?.winRatePct ?? 0}%`,
      sub: `avg win ${inr(result.summary?.avgWin)} · avg loss ${inr(result.summary?.avgLoss)}`,
    },
    {
      label: "Profit factor",
      value: result.summary?.profitFactor ?? "-",
      sub: `${result.params?.lots ?? 1} lot · ${result.params?.lotSize ?? "-"} qty per trade`,
    },
  ],

  tradeColumns: [
    { header: "Side", render: (t) => <SideBadge side={t.side} /> },
    { header: "Strike", render: (t) => <Text size="sm" fw={600}>{t.strike}</Text> },
    { header: "Entry", render: (t) => <PriceTime price={t.entryPrice} time={t.entryTime} /> },
    { header: "Exit", render: (t) => <PriceTime price={t.exitPrice} time={t.exitTime} /> },
    {
      header: "Pivot → next",
      wrap: true,
      render: (t) => (
        <>
          <Text size="sm">
            {t.pivot} → {t.nextPivot}
          </Text>
          <Text size="xs" c="dimmed">
            gap {t.gap}
          </Text>
        </>
      ),
    },
    {
      header: "Buffer / Target / SL",
      render: (t) => (
        <Text size="sm">
          {t.buffer} / <Text span c="teal" inherit>{t.target}</Text> / <Text span c="red" inherit>{t.stopLoss}</Text>
        </Text>
      ),
    },
    { header: "Exit type", wrap: true, render: (t) => <ExitCell t={t} /> },
    { header: "Points", align: "right", render: (t) => <Text size="sm" c={pnlColor(t.points)}>{t.points}</Text> },
    { header: "P&L", align: "right", render: (t) => <Text size="sm" fw={700} c={pnlColor(t.pnl)}>{inr(t.pnl)}</Text> },
    { header: "Side P&L", align: "right", render: (t) => <Text size="sm" c={pnlColor(t.sidePnlAfter)}>{inr(t.sidePnlAfter)}</Text> },
  ],

  // P&L by the pivot each trade came from (summary.byPivot)
  extraPanels: (day, result) => {
    const byPivot = result.summary?.byPivot || {};
    const rows = Object.entries(byPivot).sort((a, b) => pivotOrder.indexOf(a[0]) - pivotOrder.indexOf(b[0]));
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
  },
};

const BacktestPivotBuffer = () => <BacktestRunPage config={config} />;

export default BacktestPivotBuffer;
