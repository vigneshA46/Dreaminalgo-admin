import React from "react";
import { Text } from "@mantine/core";
import BacktestRunPage, { ExitCell, PriceTime, SideBadge } from "./BacktestRunPage";
import { inr, pnlColor } from "./backtestUtils";

const config = {
  title: "pivot_cumulative_option_buying",
  subtitle: "Runs one trading day on Dhan expired-options 1-minute data with your Dhan credentials",
  endpoint: "/api/backtest/pivot_option_buying_cum",

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
    { label: "Max lot", value: result.summary?.maxLotUsed ?? "-", sub: `profit factor ${result.summary?.profitFactor ?? "-"}` },
  ],

  tradeColumns: [
    { header: "Side", render: (t) => <SideBadge side={t.side} /> },
    { header: "Strike", render: (t) => <Text size="sm" fw={600}>{t.strike}</Text> },
    { header: "Lot (qty)", render: (t) => `${t.lot} (${t.quantity})` },
    { header: "Entry", render: (t) => <PriceTime price={t.entryPrice} time={t.entryTime} /> },
    { header: "Exit", render: (t) => <PriceTime price={t.exitPrice} time={t.exitTime} /> },
    { header: "Pivot", render: (t) => t.pivot },
    { header: "Entry reason", wrap: true, render: (t) => <Text size="xs">{t.entryReason}</Text> },
    { header: "Exit type", wrap: true, render: (t) => <ExitCell t={t} /> },
    { header: "P&L", align: "right", render: (t) => <Text size="sm" fw={700} c={pnlColor(t.pnl)}>{inr(t.pnl)}</Text> },
    { header: "Side P&L", align: "right", render: (t) => <Text size="sm" c={pnlColor(t.sidePnlAfter)}>{inr(t.sidePnlAfter)}</Text> },
  ],
};

const BacktestPivotCum = () => <BacktestRunPage config={config} />;

export default BacktestPivotCum;
