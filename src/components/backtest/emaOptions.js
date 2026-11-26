// settings for nifty_ema_crossover_retest_option_buying: same shape as the Hull MA settings, shorter strike list
export { HULL_DEFAULT_OPTIONS as EMA_DEFAULT_OPTIONS, hullOptionsValid as emaOptionsValid } from "./hullOptions";

// ITM = in the money (CE below ATM, PE above)
export const EMA_STRIKES = ["ATM", "ITM1", "ITM2", "ITM3", "ITM4"];

// nifty_supertrend_ema_buying_1min: timeframe + day MTM target / SL (both switched on by default, no strike input: ITM4 is fixed)
export const ST1M_DEFAULT_OPTIONS = {
  timeframe: 1,
  dayTarget: { enabled: true, value: 10000 },
  daySl: { enabled: true, value: 10000 },
};
