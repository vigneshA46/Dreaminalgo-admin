// formatting helpers shared by the backtest pages

export const inr = (x) => {
  if (x === null || x === undefined || Number.isNaN(Number(x))) return "-";
  const n = Number(x);
  return `${n < 0 ? "-" : ""}₹${Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

export const pnlColor = (x) => (x > 0 ? "teal" : x < 0 ? "red" : "gray");

export const exitColor = {
  TARGET: "teal",
  TRAIL: "teal",
  CYCLE_TARGET: "teal",
  DAY_TARGET: "teal",
  TRADE_TARGET: "teal",
  LINE_TOUCH: "blue",
  FLIP: "blue",
  REVERSE_CROSS: "blue",
  SUPERTREND: "blue",
  SL: "red",
  CYCLE_SL: "red",
  DAY_SL: "red",
  FORCE: "orange",
};
