// settings for nifty_ema_crossover_retest_option_buying: same shape as the Hull MA settings, shorter strike list
export { HULL_DEFAULT_OPTIONS as EMA_DEFAULT_OPTIONS, hullOptionsValid as emaOptionsValid } from "./hullOptions";

// ITM = in the money (CE below ATM, PE above)
export const EMA_STRIKES = ["ATM", "ITM1", "ITM2", "ITM3", "ITM4"];
