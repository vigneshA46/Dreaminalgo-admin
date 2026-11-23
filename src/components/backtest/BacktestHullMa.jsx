import React from "react";
import { Badge, Text } from "@mantine/core";
import BacktestRunPage, { ExitCell, PriceTime, SideBadge } from "./BacktestRunPage";
import { HullCandlesPanel } from "./HullCandlesPanel";
import { HullOptionsForm } from "./HullOptionsForm";
import { HULL_DEFAULT_OPTIONS, hullOptionsValid } from "./hullOptions";
import { inr, pnlColor } from "./backtestUtils";

const config = {
  title: "nifty_hull_ma_option_buying",
  subtitle:
    "Hull MA 24 on NIFTY candles (your timeframe). The colour at 09:30 is the starting colour; every later candle close with a new colour is a signal — " +
    "green buys CE, red buys PE (ATM or ITM1–ITM5 from that candle's close), and the other side is closed. 1 lot, optional day MTM target and day MTM SL, square off 15:14.",
  endpoint: "/api/backtest/nifty_hull_ma_option_buying",
  defaultOptions: HULL_DEFAULT_OPTIONS,
  OptionsForm: HullOptionsForm,
  optionsValid: hullOptionsValid,

  stats: (day, result) => [
    { label: "Day P&L", value: inr(day.dayPnl), color: pnlColor(day.dayPnl) },
    { label: "CE P&L", value: inr(day.ce.pnl), color: pnlColor(day.ce.pnl) },
    { label: "PE P&L", value: inr(day.pe.pnl), color: pnlColor(day.pe.pnl) },
    { label: "Trades", value: day.totalTrades, sub: `${day.flips} colour change${day.flips === 1 ? "" : "s"}` },
    {
      label: "Win rate",
      value: `${result.summary?.winRatePct ?? 0}%`,
      sub: `avg win ${inr(result.summary?.avgWin)} · avg loss ${inr(result.summary?.avgLoss)}`,
    },
    { label: "Day stopped by", value: day.dayStoppedBy ? day.dayStoppedBy.replace("DAY MTM ", "") : "none", sub: day.dayStoppedBy ? "day MTM limit" : "ran to 15:14" },
  ],

  tradeColumns: [
    { header: "Side", render: (t) => <SideBadge side={t.side} /> },
    {
      header: "Strike",
      render: (t) => (
        <>
          <Text size="sm" fw={600}>
            {t.strike}
          </Text>
          <Text size="xs" c="dimmed">
            {t.strikeType}
          </Text>
        </>
      ),
    },
    { header: "Entry", render: (t) => <PriceTime price={t.entryPrice} time={t.entryTime} /> },
    { header: "Exit", render: (t) => <PriceTime price={t.exitPrice} time={t.exitTime} /> },
    {
      header: "Signal candle",
      render: (t) => (
        <>
          <Badge size="xs" variant="light" color={t.signalColor === "green" ? "teal" : "red"}>
            {t.signalColor}
          </Badge>
          <Text size="xs" c="dimmed">
            {t.signalCandle.start}–{t.signalCandle.end} · NIFTY {t.signalCandle.close}
          </Text>
        </>
      ),
    },
    { header: "Exit type", wrap: true, render: (t) => <ExitCell t={t} /> },
    { header: "Points", align: "right", render: (t) => <Text size="sm" c={pnlColor(t.points)}>{t.points}</Text> },
    { header: "P&L", align: "right", render: (t) => <Text size="sm" fw={700} c={pnlColor(t.pnl)}>{inr(t.pnl)}</Text> },
    { header: "Day P&L", align: "right", render: (t) => <Text size="sm" c={pnlColor(t.dayPnlAfter)}>{inr(t.dayPnlAfter)}</Text> },
  ],

  bottomPanels: (day, result) => (
    <HullCandlesPanel candles={day.hmaCandles} trades={day.trades} timeframe={result.params?.candleMinutes} warmup={day.warmup} />
  ),
};

const BacktestHullMa = () => <BacktestRunPage config={config} />;

export default BacktestHullMa;
