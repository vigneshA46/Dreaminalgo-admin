import React from "react";
import BacktestRunPage from "./BacktestRunPage";
import { makeHourlyRangeConfig } from "./hourlyRangeConfig";

const config = makeHourlyRangeConfig({
  title: "nifty_hourly_range_touch",
  endpoint: "/api/backtest/nifty_hourly_range_touch",
  candleMinutes: 3,
});

const BacktestHourlyRange = () => <BacktestRunPage config={config} />;

export default BacktestHourlyRange;
