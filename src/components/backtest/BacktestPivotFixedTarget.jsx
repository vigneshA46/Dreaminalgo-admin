import React from "react";
import { Badge, Text } from "@mantine/core";
import BacktestRunPage, { ExitCell, PivotPnlPanel, PriceTime, SideBadge } from "./BacktestRunPage";
import { inr, pnlColor } from "./backtestUtils";

const isTickEntry = (t) => t.entryReason?.startsWith("Tick");

const config = {
  title: "nifty_option_pivot_fixed_target",
  subtitle:
    "Pivot touch arms it → entry on a candle close above the pivot (avg-price rule) or a tick at pivot + 8. " +
    "Target entry + 10 points, SL candle close below the pivot. 1 lot.",
  endpoint: "/api/backtest/nifty_option_pivot_fixed_target",

  stats: (day, result) => {
    const tick = day.trades.filter(isTickEntry).length;
    return [
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
        label: "Entries",
        value: `${tick} / ${day.trades.length - tick}`,
        sub: `tick (pivot + 8) / candle close · PF ${result.summary?.profitFactor ?? "-"}`,
      },
    ];
  },

  tradeColumns: [
    { header: "Side", render: (t) => <SideBadge side={t.side} /> },
    { header: "Strike", render: (t) => <Text size="sm" fw={600}>{t.strike}</Text> },
    { header: "Entry", render: (t) => <PriceTime price={t.entryPrice} time={t.entryTime} /> },
    { header: "Exit", render: (t) => <PriceTime price={t.exitPrice} time={t.exitTime} /> },
    { header: "Pivot", render: (t) => t.pivot },
    { header: "Target", render: (t) => <Text size="sm" c="teal">{t.target}</Text> },
    {
      header: "Entry type",
      render: (t) => (
        <Badge variant="light" color={isTickEntry(t) ? "cyan" : "indigo"}>
          {isTickEntry(t) ? "Tick +8" : "Candle close"}
        </Badge>
      ),
    },
    { header: "Exit type", wrap: true, render: (t) => <ExitCell t={t} /> },
    { header: "Points", align: "right", render: (t) => <Text size="sm" c={pnlColor(t.points)}>{t.points}</Text> },
    { header: "P&L", align: "right", render: (t) => <Text size="sm" fw={700} c={pnlColor(t.pnl)}>{inr(t.pnl)}</Text> },
    { header: "Side P&L", align: "right", render: (t) => <Text size="sm" c={pnlColor(t.sidePnlAfter)}>{inr(t.sidePnlAfter)}</Text> },
  ],

  extraPanels: (day, result) => <PivotPnlPanel byPivot={result.summary?.byPivot} />,
};

const BacktestPivotFixedTarget = () => <BacktestRunPage config={config} />;

export default BacktestPivotFixedTarget;
