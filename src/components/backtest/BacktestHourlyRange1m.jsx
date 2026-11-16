import React from "react";
import BacktestRunPage from "./BacktestRunPage";
import { makeHourlyRangeConfig } from "./hourlyRangeConfig";

const config = makeHourlyRangeConfig({
  title: "nifty_hourly_range_touch_1m",
  endpoint: "/api/backtest/nifty_hourly_range_touch_1m",
  candleMinutes: 1,
});

const BacktestHourlyRange1m = () => <BacktestRunPage config={config} />;

export default BacktestHourlyRange1m;
