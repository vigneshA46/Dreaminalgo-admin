import React from "react";
import { Badge, Text } from "@mantine/core";
import BacktestRunPage, { ExitCell, PriceTime, SideBadge } from "./BacktestRunPage";
import { BearishCandlesPanel, BearishSelectionPanel } from "./BearishPanels";
import { inr, pnlColor } from "./backtestUtils";

const config = {
  title: "nifty_bearish_breakout_option_buying",
  subtitle:
    "CE and PE run independently, each on one strike priced at or just above 200 at 09:30. The latest bearish 15-min candle marks its high; a tick above high + 4 buys 1 lot, " +
    "SL = low of that 15-min candle, then the stop follows the low of every completed 5-min Heikin Ashi candle (up or down). After an exit a fresh bearish 15-min candle is needed. Square off 15:14.",
  endpoint: "/api/backtest/nifty_bearish_breakout_option_buying",

  stats: (day, result) => [
    { label: "Day P&L", value: inr(day.dayPnl), color: pnlColor(day.dayPnl) },
    { label: "CE P&L", value: inr(day.ce.pnl), color: pnlColor(day.ce.pnl) },
    { label: "PE P&L", value: inr(day.pe.pnl), color: pnlColor(day.pe.pnl) },
    { label: "Trades", value: day.totalTrades, sub: `${day.trails} trail · ${day.stopLosses} candle-low SL` },
    {
      label: "Win rate",
      value: `${result.summary?.winRatePct ?? 0}%`,
      sub: `avg win ${inr(result.summary?.avgWin)} · avg loss ${inr(result.summary?.avgLoss)}`,
    },
    { label: "Strikes", value: `${day.selection?.CE?.strike ?? "-"} / ${day.selection?.PE?.strike ?? "-"}`, sub: "CE / PE at 09:30" },
  ],

  tradeColumns: [
    { header: "Side", render: (t) => <SideBadge side={t.side} /> },
    { header: "Strike", render: (t) => <Text size="sm" fw={600}>{t.strike}</Text> },
    { header: "Entry", render: (t) => <PriceTime price={t.entryPrice} time={t.entryTime} /> },
    { header: "Exit", render: (t) => <PriceTime price={t.exitPrice} time={t.exitTime} /> },
    {
      header: "Bearish candle",
      render: (t) => (
        <>
          <Text size="sm">{t.bearishCandle?.start}</Text>
          <Text size="xs" c="dimmed">
            high {t.markedHigh} → above {t.entryLevel}
          </Text>
        </>
      ),
    },
    { header: "Initial SL", render: (t) => <Text size="sm" c="red">{t.initialSl}</Text> },
    {
      header: "Last stop",
      render: (t) => (
        <>
          <Text size="sm">{t.finalSl}</Text>
          <Badge size="xs" variant="light" color={t.slMoves?.length ? "orange" : "gray"}>
            {t.slMoves?.length ? `${t.slMoves.length} HA move${t.slMoves.length === 1 ? "" : "s"}` : "candle low"}
          </Badge>
        </>
      ),
    },
    { header: "Exit type", wrap: true, render: (t) => <ExitCell t={t} /> },
    { header: "Points", align: "right", render: (t) => <Text size="sm" c={pnlColor(t.points)}>{t.points}</Text> },
    { header: "P&L", align: "right", render: (t) => <Text size="sm" fw={700} c={pnlColor(t.pnl)}>{inr(t.pnl)}</Text> },
    { header: "Side P&L", align: "right", render: (t) => <Text size="sm" c={pnlColor(t.sidePnlAfter)}>{inr(t.sidePnlAfter)}</Text> },
  ],

  extraPanels: (day) => (
    <>
      <BearishSelectionPanel selection={day.selection} />
      <BearishCandlesPanel legCandles={day.legCandles} trades={day.trades} />
    </>
  ),
};

const BacktestBearishBreakout = () => <BacktestRunPage config={config} />;

export default BacktestBearishBreakout;
