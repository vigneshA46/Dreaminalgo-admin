import React from "react";
import BacktestRunPage from "./BacktestRunPage";
import { makeHourlyRangeConfig } from "./hourlyRangeConfig";
import { HourlyOptionsForm } from "./HourlyOptionsForm";
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
    "(that line stays armed for the next entry in the same cycle) or the limits below. No entry limit.",
  defaultOptions: HOURLY_DEFAULT_OPTIONS,
  OptionsForm: HourlyOptionsForm,
  optionsValid: hourlyOptionsValid,
};

const BacktestHourlyRangeCustom = () => <BacktestRunPage config={config} />;

export default BacktestHourlyRangeCustom;
