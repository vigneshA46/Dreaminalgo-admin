import React from "react";
import { Badge, Text } from "@mantine/core";
import { ExitCell, PriceTime, SideBadge } from "./BacktestRunPage";
import { HourlyCyclesPanel } from "./HourlyCyclesPanel";
import { inr, pnlColor } from "./backtestUtils";

/** Page settings for the NIFTY hourly range touch backtests (3-min and 1-min entry versions). */
export const makeHourlyRangeConfig = ({ title, endpoint, candleMinutes }) => ({
  title,
  subtitle:
    `NIFTY hourly High / Low (first 5 hours), each traded in the next hour. Touch a line → ${candleMinutes}-min NIFTY close beyond it with ` +
    `line < avg < close → buy ATM CE / PE, 1 lot. SL ${candleMinutes}-min close back through the line. Cycle limits −₹3,500 / +₹5,000, max 2 entries.`,
  endpoint,

  stats: (day, result) => {
    const stopped = (day.cycles || []).filter((c) => c.stoppedBy);
    return [
      { label: "Day P&L", value: inr(day.dayPnl), color: pnlColor(day.dayPnl) },
      { label: "CE P&L", value: inr(day.ce.pnl), color: pnlColor(day.ce.pnl) },
      { label: "PE P&L", value: inr(day.pe.pnl), color: pnlColor(day.pe.pnl) },
      { label: "Trades", value: day.totalTrades, sub: `${day.targets} cycle target · ${day.stopLosses} SL` },
      {
        label: "Win rate",
        value: `${result.summary?.winRatePct ?? 0}%`,
        sub: `avg win ${inr(result.summary?.avgWin)} · avg loss ${inr(result.summary?.avgLoss)}`,
      },
      {
        label: "Cycles stopped",
        value: `${stopped.length} / ${day.cycles?.length ?? 5}`,
        sub: stopped.map((c) => `C${c.cycle} ${c.stoppedBy.toLowerCase()}`).join(" · ") || "none",
      },
    ];
  },

  tradeColumns: [
    { header: "Cycle", render: (t) => <Badge variant="outline" radius="sm">C{t.cycle}</Badge> },
    { header: "Side", render: (t) => <SideBadge side={t.side} /> },
    { header: "Strike", render: (t) => <Text size="sm" fw={600}>{t.strike}</Text> },
    { header: "Entry", render: (t) => <PriceTime price={t.entryPrice} time={t.entryTime} /> },
    { header: "Exit", render: (t) => <PriceTime price={t.exitPrice} time={t.exitTime} /> },
    {
      header: "Line",
      render: (t) => (
        <Text size="sm" c={t.line === "HIGH" ? "teal" : "red"}>
          {t.line} {t.lineValue}
        </Text>
      ),
    },
    {
      header: "Signal candle",
      render: (t) => (
        <>
          <Text size="sm">close {t.signalCandle.close}</Text>
          <Text size="xs" c="dimmed">
            avg {t.signalCandle.avg}
          </Text>
        </>
      ),
    },
    { header: "Exit type", wrap: true, render: (t) => <ExitCell t={t} /> },
    { header: "Points", align: "right", render: (t) => <Text size="sm" c={pnlColor(t.points)}>{t.points}</Text> },
    { header: "P&L", align: "right", render: (t) => <Text size="sm" fw={700} c={pnlColor(t.pnl)}>{inr(t.pnl)}</Text> },
    { header: "Cycle P&L", align: "right", render: (t) => <Text size="sm" c={pnlColor(t.cyclePnlAfter)}>{inr(t.cyclePnlAfter)}</Text> },
  ],

  extraPanels: (day) => <HourlyCyclesPanel cycles={day.cycles} />,
});
