// settings for nifty_hourly_range_touch_custom (shared by the page and its form)

// same defaults as the backend (hourlyRange.service.js CUSTOM_DEFAULTS)
export const HOURLY_DEFAULT_OPTIONS = {
  timeframe: 3,
  strike: "ITM2",
  daySl: { enabled: false, value: 7000 },
  cycleSl: { enabled: true, value: 3500 },
  dayProfit: { enabled: false, value: 10000 },
  cycleProfit: { enabled: true, value: 5000 },
  tradeProfit: { enabled: false, value: 2000 },
};

// ITM = in the money (CE below ATM, PE above), OTM = out of the money
export const HOURLY_STRIKES = ["ITM3", "ITM2", "ITM1", "ATM", "OTM1", "OTM2"];

export const HOURLY_LIMITS = [
  ["daySl", "Day SL", "Stop for the day at this loss"],
  ["cycleSl", "Cycle SL", "Stop the cycle at this loss"],
  ["dayProfit", "Day profit", "Stop for the day at this profit"],
  ["cycleProfit", "Cycle profit", "Stop the cycle at this profit"],
  ["tradeProfit", "Trade profit", "Exit a trade at this profit"],
];

/** Enabled limits need a value above 0. */
export const hourlyOptionsValid = (o) => HOURLY_LIMITS.every(([k]) => !o[k].enabled || Number(o[k].value) > 0);
