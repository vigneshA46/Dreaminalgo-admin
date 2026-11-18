import React from "react";
import BacktestRunPage from "./BacktestRunPage";
import { makeHourlyRangeConfig } from "./hourlyRangeConfig";
import { HourlyOptionsForm } from "./HourlyOptionsForm";
import { IndexCandlesPanel } from "./IndexCandlesPanel";
import { HOURLY_DEFAULT_OPTIONS, hourlyOptionsValid } from "./hourlyOptions";

const config = {
  ...makeHourlyRangeConfig({
    title: "nifty_hourly_range_touch_custom",
    endpoint: "/api/backtest/nifty_hourly_range_touch_custom",
    candleMinutes: 3,
  }),
  subtitle:
    "NIFTY hourly High / Low (first 5 hours), each traded in the next hour, with your settings below. Line touch → candle close beyond it " +
    "with line < avg < close → CE / PE at the chosen strike (ATM / ITM / OTM), 1 lot. Exits: candle close back through the entry line, a NIFTY touch of the cycle's other line " +
    "(that line stays armed for the next entry in the same cycle) or the limits below. A line counts as touched within the touch buffer. No entry limit.",
  defaultOptions: HOURLY_DEFAULT_OPTIONS,
  OptionsForm: HourlyOptionsForm,
  optionsValid: hourlyOptionsValid,
  bottomPanels: (day, result) => (
    <IndexCandlesPanel candles={day.indexCandles} trades={day.trades} timeframe={result.params?.candleMinutes} />
  ),
};

const BacktestHourlyRangeCustom = () => <BacktestRunPage config={config} />;

export default BacktestHourlyRangeCustom;
