import React from "react";
import { Badge, Text } from "@mantine/core";
import BacktestRunPage, { ExitCell, PriceTime, SideBadge } from "./BacktestRunPage";
import { EmaCandlesPanel } from "./EmaCandlesPanel";
import { EmaSupertrendOptionsForm } from "./EmaOptionsForm";
import { EMA_DEFAULT_OPTIONS, emaOptionsValid } from "./emaOptions";
import { inr, pnlColor } from "./backtestUtils";

const config = {
  title: "nifty_ema_supertrend_option_buying",
  subtitle:
    "EMA 5 / EMA 10 crossover with retest, filtered by Supertrend (10, 1.5) on NIFTY candles of your timeframe. A candle must close beyond EMA 10 with the Supertrend on the trade's side, " +
    "then a candle retests EMA 5 with the Supertrend still on its side → entry: bullish buys CE, bearish buys PE (ATM or ITM1–ITM4, 1 lot). Exit when the Supertrend turns against the trade. " +
    "Optional day MTM target and day MTM SL, square off 15:14. Pick one date or a range; a range shows overall analysis with one dropdown per day.",
  endpoint: "/api/backtest/nifty_ema_supertrend_option_buying",
  dateRange: true,
  defaultOptions: EMA_DEFAULT_OPTIONS,
  OptionsForm: EmaSupertrendOptionsForm,
  optionsValid: emaOptionsValid,

  stats: (day, result) => [
    { label: "Day P&L", value: inr(day.dayPnl), color: pnlColor(day.dayPnl) },
    { label: "CE P&L", value: inr(day.ce.pnl), color: pnlColor(day.ce.pnl) },
    { label: "PE P&L", value: inr(day.pe.pnl), color: pnlColor(day.pe.pnl) },
    { label: "Trades", value: day.totalTrades, sub: `${day.supertrendExits} Supertrend exit${day.supertrendExits === 1 ? "" : "s"}` },
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
    {
      header: "Supertrend",
      render: (t) => (
        <>
          <Text size="xs">entry: {t.supertrendAtEntry ? `${t.supertrendAtEntry.trend} ${t.supertrendAtEntry.value}` : "-"}</Text>
          <Text size="xs" c="dimmed">
            exit: {t.supertrendAtExit ? `${t.supertrendAtExit.trend} ${t.supertrendAtExit.value}` : "-"}
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
    <EmaCandlesPanel candles={day.emaCandles} trades={day.trades} timeframe={result.params?.candleMinutes} warmup={day.warmup} />
  ),
};

const BacktestEmaSupertrend = () => <BacktestRunPage config={config} />;

export default BacktestEmaSupertrend;
