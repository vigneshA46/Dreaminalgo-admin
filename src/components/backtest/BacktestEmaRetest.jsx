import React from "react";
import { Badge, Text } from "@mantine/core";
import BacktestRunPage, { ExitCell, PriceTime, SideBadge } from "./BacktestRunPage";
import { EmaCandlesPanel } from "./EmaCandlesPanel";
import { EmaOptionsForm } from "./EmaOptionsForm";
import { EMA_DEFAULT_OPTIONS, emaOptionsValid } from "./emaOptions";
import { inr, pnlColor } from "./backtestUtils";

const config = {
  title: "nifty_ema_crossover_retest_option_buying",
  subtitle:
    "NIFTY EMA 5 / EMA 10 on your timeframe. EMA 5 crosses EMA 10 → a later candle closes beyond EMA 10 → a later candle retests EMA 5 → entry: bullish buys CE, bearish buys PE " +
    "(ATM or ITM1–ITM4, 1 lot). Exit on the reverse crossover. Optional day MTM target and day MTM SL, square off 15:14. Pick one date or a range; a range shows overall analysis with one dropdown per day.",
  endpoint: "/api/backtest/nifty_ema_crossover_retest_option_buying",
  dateRange: true,
  defaultOptions: EMA_DEFAULT_OPTIONS,
  OptionsForm: EmaOptionsForm,
  optionsValid: emaOptionsValid,

  stats: (day, result) => [
    { label: "Day P&L", value: inr(day.dayPnl), color: pnlColor(day.dayPnl) },
    { label: "CE P&L", value: inr(day.ce.pnl), color: pnlColor(day.ce.pnl) },
    { label: "PE P&L", value: inr(day.pe.pnl), color: pnlColor(day.pe.pnl) },
    { label: "Trades", value: day.totalTrades, sub: `${day.reverseExits} reverse crossover${day.reverseExits === 1 ? "" : "s"}` },
    {
      label: "Win rate",
      value: `${result.summary?.winRatePct ?? 0}%`,
      sub: `avg win ${inr(result.summary?.avgWin)} · avg loss ${inr(result.summary?.avgLoss)}`,
    },
    { label: "Day stopped by", value: day.dayStoppedBy ? day.dayStoppedBy.replace("DAY MTM ", "") : "none", sub: day.dayStoppedBy ? "day MTM limit" : "ran to 15:14" },
  ],

  tradeColumns: [
    {
      header: "Side",
      render: (t) => (
        <>
          <SideBadge side={t.side} />
          <Text size="xs" c="dimmed">
            {t.signalType} setup
          </Text>
        </>
      ),
    },
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
      header: "Setup",
      render: (t) => (
        <>
          <Text size="xs">cross {t.crossTime} · close {t.confirmTime}</Text>
          <Badge size="xs" variant="light" color="grape">
            retest {t.retestCandle?.start}–{t.retestCandle?.end} · EMA5 {t.retestCandle?.ema5}
          </Badge>
        </>
      ),
    },
    { header: "Exit type", wrap: true, render: (t) => <ExitCell t={t} /> },
    { header: "Points", align: "right", render: (t) => <Text size="sm" c={pnlColor(t.points)}>{t.points}</Text> },
    { header: "P&L", align: "right", render: (t) => <Text size="sm" fw={700} c={pnlColor(t.pnl)}>{inr(t.pnl)}</Text> },
    { header: "Day P&L", align: "right", render: (t) => <Text size="sm" c={pnlColor(t.dayPnlAfter)}>{inr(t.dayPnlAfter)}</Text> },
  ],

  bottomPanels: (day, result) => (
    <EmaCandlesPanel candles={day.emaCandles} trades={day.trades} timeframe={result.params?.candleMinutes} warmup={day.warmup} />
  ),
};

const BacktestEmaRetest = () => <BacktestRunPage config={config} />;

export default BacktestEmaRetest;
