import React from "react";
import { HullOptionsForm } from "./HullOptionsForm";
import { EMA_STRIKES } from "./emaOptions";

/** Settings for nifty_ema_crossover_retest_option_buying: timeframe, strike, day MTM target and day MTM SL. */
export const EmaOptionsForm = (props) => (
  <HullOptionsForm {...props} strikes={EMA_STRIKES} timeframeHint="NIFTY candles EMA 5 and EMA 10 are drawn on." />
);

export const EmaSupertrendOptionsForm = (props) => (
  <HullOptionsForm {...props} strikes={EMA_STRIKES} timeframeHint="NIFTY candles EMA 5, EMA 10 and the Supertrend (10, 1.5) are drawn on." />
);

export const EmaRejectionOptionsForm = (props) => (
  <HullOptionsForm {...props} strikes={EMA_STRIKES} timeframeHint="NIFTY candles EMA 5, EMA 10 and the Supertrend (10, 1.5) are drawn on." />
);
