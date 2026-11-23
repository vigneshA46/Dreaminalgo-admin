// settings for nifty_hull_ma_option_buying (shared by the page and its form)

// same defaults as the backend (hullMa.service.js HULL_DEFAULTS)
export const HULL_DEFAULT_OPTIONS = {
  timeframe: 5,
  strike: "ITM1",
  dayTarget: { enabled: false, value: 5000 },
  daySl: { enabled: false, value: 3000 },
};

export const HULL_TIMEFRAMES = [1, 3, 5, 15];

// ITM = in the money (CE below ATM, PE above)
export const HULL_STRIKES = ["ATM", "ITM1", "ITM2", "ITM3", "ITM4", "ITM5"];

export const HULL_LIMITS = [
  ["dayTarget", "Day MTM target", "Stop for the day at this profit (realised + open)"],
  ["daySl", "Day MTM SL", "Stop for the day at this loss (realised + open)"],
];

/** Enabled limits need a value above 0. */
export const hullOptionsValid = (o) => HULL_LIMITS.every(([k]) => !o[k].enabled || Number(o[k].value) > 0);
