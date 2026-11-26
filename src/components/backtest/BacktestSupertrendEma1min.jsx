import React from "react";
import { Text } from "@mantine/core";
import BacktestRunPage, { ExitCell, PriceTime, SideBadge } from "./BacktestRunPage";
import { EmaCandlesPanel } from "./EmaCandlesPanel";
import { SupertrendEma1minOptionsForm } from "./EmaOptionsForm";
import { ST1M_DEFAULT_OPTIONS, emaOptionsValid } from "./emaOptions";
import { inr, pnlColor } from "./backtestUtils";

const config = {
  title: "nifty_supertrend_ema_buying_1min",
  subtitle:
    "NIFTY option buying on EMA 5 / EMA 10 and Supertrend (10, 1.5) of the NIFTY index, on candles of your timeframe (1 / 3 / 5 / 15 min). The first entry of the day needs the close beyond the 09:16 line (close of the first 1-minute candle) with Supertrend and the EMA order on the same side; later entries only need Supertrend and the EMA order to agree. Buys the 200-points-in-the-money option (ITM4), lots alternate 2, 4, 2, 4. At ₹3,000 trade profit half the lots are booked, the rest ride until Supertrend flips (before ₹3,000 a flip exits everything). Day MTM target and SL can each be switched off, square off 15:14. Pick one date or a range; a range shows overall analysis with one dropdown per day.",
  endpoint: "/api/backtest/nifty_supertrend_ema_buying_1min",
  dateRange: true,
  defaultOptions: ST1M_DEFAULT_OPTIONS,
  OptionsForm: SupertrendEma1minOptionsForm,
  optionsValid: emaOptionsValid,

  stats: (day, result) => [
    { label: "Day P&L", value: inr(day.dayPnl), color: pnlColor(day.dayPnl) },
    { label: "CE P&L", value: inr(day.ce.pnl), color: pnlColor(day.ce.pnl) },
    { label: "PE P&L", value: inr(day.pe.pnl), color: pnlColor(day.pe.pnl) },
    { label: "Entries", value: day.entries, sub: `${day.partials} half-booked · ${day.supertrendExits} Supertrend exit${day.supertrendExits === 1 ? "" : "s"}` },
    {
      label: "Win rate",
      value: `${result.summary?.winRatePct ?? 0}%`,
      sub: `avg win ${inr(result.summary?.avgWin)} · avg loss ${inr(result.summary?.avgLoss)}`,
    },
    { label: "Day stopped by", value: day.dayStoppedBy ? day.dayStoppedBy.replace("DAY MTM ", "") : "none", sub: day.dayStoppedBy ? "day MTM limit" : "ran to 15:14" },
  ],

  tradeColumns: [
    {
      header: "Side / lots",
      render: (t) => (
        <>
          <SideBadge side={t.side} />
          <Text size="xs" c="dimmed">
            {t.lot} of {t.entryLots} lots
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
    { header: "Entry signal", wrap: true, render: (t) => <Text size="xs">{t.entryReason}</Text> },
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

const BacktestSupertrendEma1min = () => <BacktestRunPage config={config} />;

export default BacktestSupertrendEma1min;
