import React from "react";
import { Badge, Text } from "@mantine/core";
import BacktestRunPage, { ExitCell, PriceTime, SideBadge } from "./BacktestRunPage";
import { SdLevelsPanel, SdSupertrendPanel } from "./SdFibPanels";
import { inr, pnlColor } from "./backtestUtils";

const config = {
  title: "nifty_sd_fib_buy_above_st",
  subtitle:
    "NIFTY ATM CE and PE of the day, each on its own. Levels come from a one-year NIFTY daily volatility (average + 1 SD of the daily log returns) × the option's 09:15 open; only BUY ABOVE (0.2611 × the 1SD range) trades, the other 14 levels are reference. Entry: a tick through BUY ABOVE + 8 or a 5-min close above it, with the option's Supertrend (10, 3) bullish and BUY ABOVE armed. Only exits: Supertrend bearish on a 5-min close, and 15:14. 1 lot, re-entries allowed, no day limits. Pick one date or a range.",
  endpoint: "/api/backtest/nifty_sd_fib_buy_above_st",
  dateRange: true,

  stats: (day, result) => [
    { label: "Day P&L", value: inr(day.dayPnl), color: pnlColor(day.dayPnl) },
    { label: "CE P&L", value: inr(day.ce.pnl), color: pnlColor(day.ce.pnl) },
    { label: "PE P&L", value: inr(day.pe.pnl), color: pnlColor(day.pe.pnl) },
    { label: "Trades", value: day.totalTrades, sub: `${day.tickEntries} tick · ${day.candleEntries} candle entr${day.tickEntries + day.candleEntries === 1 ? "y" : "ies"}` },
    {
      label: "Win rate",
      value: `${result.summary?.winRatePct ?? 0}%`,
      sub: `avg win ${inr(result.summary?.avgWin)} · avg loss ${inr(result.summary?.avgLoss)}`,
    },
    { label: "ATM strike", value: day.atmStrike ?? "-", sub: `option vol ${day.volatility?.optionVol ?? "-"}` },
  ],

  tradeColumns: [
    { header: "Side", render: (t) => <SideBadge side={t.side} /> },
    { header: "Strike", render: (t) => <Text size="sm" fw={600}>{t.strike}</Text> },
    { header: "Entry", render: (t) => <PriceTime price={t.entryPrice} time={t.entryTime} /> },
    { header: "Exit", render: (t) => <PriceTime price={t.exitPrice} time={t.exitTime} /> },
    {
      header: "Entry type",
      render: (t) => (
        <>
          <Badge size="xs" variant="light" color={t.entryType === "TICK" ? "grape" : "blue"}>
            {t.entryType}
          </Badge>
          <Text size="xs" c="dimmed">
            BUY ABOVE {t.buyAbove}
          </Text>
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
    { header: "Side P&L", align: "right", render: (t) => <Text size="sm" c={pnlColor(t.sidePnlAfter)}>{inr(t.sidePnlAfter)}</Text> },
  ],

  extraPanels: (day) => <SdLevelsPanel day={day} />,
  bottomPanels: (day) => <SdSupertrendPanel supertrend={day.supertrend} trades={day.trades} />,
};

const BacktestSdFibBuyAboveSt = () => <BacktestRunPage config={config} />;

export default BacktestSdFibBuyAboveSt;
