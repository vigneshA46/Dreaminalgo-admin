import React from "react";
import { Text } from "@mantine/core";
import BacktestRunPage, { ExitCell, PivotPnlPanel, PriceTime, SideBadge } from "./BacktestRunPage";
import { inr, pnlColor } from "./backtestUtils";

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

  extraPanels: (day, result) => <PivotPnlPanel byPivot={result.summary?.byPivot} />,
};

const BacktestPivotBuffer = () => <BacktestRunPage config={config} />;

export default BacktestPivotBuffer;
