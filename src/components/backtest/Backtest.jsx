import React from "react";
import { Badge, Box, Card, Group, SimpleGrid, Tabs, Text, ThemeIcon } from "@mantine/core";
import { IconArrowRight, IconChartCandle, IconPlayerPlay, IconUsers } from "@tabler/icons-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import BacktestAccess from "./BacktestAccess";

// one card per strategy that has a backtest API
const strategies = [
  {
    title: "pivot_cumulative_option_buying",
    description:
      "NIFTY CE + PE option buying on previous-day pivot levels (P, R1–R3, S1–S3). " +
      "Cumulative ₹3,250 side target, lots 2 → 15 (+1 lot on every 2nd SL in a row), strike change outside 170–280, −₹13,000 day stop.",
    tags: ["NIFTY", "Options", "1-min data"],
    path: "/backtest/pivot-cumulative-option-buying",
  },
  {
    title: "nifty_option_pivot_buffer",
    description:
      "NIFTY CE + PE option buying, all tick based. Pivot touch arms it, entry at pivot + 25% of the gap to the next pivot, " +
      "target entry + 30% of the gap, SL back at the pivot. 1 lot, same 09:17 selection and strike change.",
    tags: ["NIFTY", "Options", "1-min data"],
    path: "/backtest/nifty-option-pivot-buffer",
  },
  {
    title: "nifty_option_pivot_fixed_target",
    description:
      "NIFTY CE + PE option buying. Same pivot touch and entry as pivot_cumulative (candle close with avg-price rule, " +
      "or tick at pivot + 8). Fixed +10 point target, SL candle close below the pivot. 1 lot.",
    tags: ["NIFTY", "Options", "1-min data"],
    path: "/backtest/nifty-option-pivot-fixed-target",
  },
  {
    title: "nifty_option_level_breakout",
    description:
      "NIFTY ATM CE + PE (strike from the 09:15 close, fixed all day). range = prev-day (H − L) × 26.11%, " +
      "buy above = open + range, targets every range up to T11. 5-min close above buy above → 1 lot. " +
      "The only exit is the Supertrend (10, 3) of the option's 5-min chart turning sell (square off 15:14).",
    tags: ["NIFTY", "Options", "5-min + Supertrend"],
    path: "/backtest/nifty-option-level-breakout",
  },
  {
    title: "nifty_hourly_range_touch",
    description:
      "NIFTY hourly High / Low of the first 5 hours, each traded in the next hour. Line touch + 3-min NIFTY close beyond it " +
      "with avg-price confirmation → ATM CE / PE, 1 lot. SL 3-min close back through the line, cycle limits −₹3,500 / +₹5,000, max 2 entries per cycle.",
    tags: ["NIFTY", "Options", "1-hour + 3-min"],
    path: "/backtest/nifty-hourly-range-touch",
  },
  {
    title: "nifty_hourly_range_touch_1m",
    description:
      "Same as nifty_hourly_range_touch with 1-min NIFTY candles: line touch + 1-min close beyond it with avg-price confirmation → " +
      "ATM CE / PE, 1 lot. SL 1-min close back through the line, cycle limits −₹3,500 / +₹5,000, max 2 entries per cycle.",
    tags: ["NIFTY", "Options", "1-hour + 1-min"],
    path: "/backtest/nifty-hourly-range-touch-1m",
  },
  {
    title: "nifty_hourly_range_touch_custom",
    description:
      "Hourly High / Low touch strategy with your settings: 1 / 3 / 5-min candles, strike (default ITM2), day / cycle SL and profit, trade profit. " +
      "Also exits when NIFTY touches the cycle's other line, which stays armed for the next entry. No entry limit.",
    tags: ["NIFTY", "Options", "Custom settings"],
    path: "/backtest/nifty-hourly-range-touch-custom",
  },
  {
    title: "nifty_bearish_breakout_option_buying",
    description:
      "NIFTY CE + PE, each on one strike priced at or just above 200 at 09:30. Latest bearish 15-min candle marks its high; a tick above high + 4 buys 1 lot, " +
      "SL = low of that 15-min candle, then trail on the low − 2 of each completed 5-min Heikin Ashi candle. Fresh bearish candle needed after every exit. Square off 15:14.",
    tags: ["NIFTY", "Options", "15-min + 5-min HA"],
    path: "/backtest/nifty-bearish-breakout-option-buying",
  },  {
    title: "nifty_hull_ma_option_buying",
    description:
      "NIFTY Hull MA (24) on 1 / 3 / 5 / 15-min candles. From 09:30 every colour change is a signal: green buys CE, red buys PE (ATM or ITM1–ITM5), the other side is closed. " +
      "1 lot, optional day MTM target and day MTM SL, square off 15:14.",
    tags: ["NIFTY", "Options", "Hull MA 24"],
    path: "/backtest/nifty-hull-ma-option-buying",
  },

];

const Backtest = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "access" ? "access" : "run";

  return (
    <Box p="md">
      <Text size="xl" fw={700}>
        Backtest
      </Text>
      <Text size="sm" c="dimmed" mb="lg">
        Run a strategy on historical Dhan data, or choose which users can backtest it
      </Text>

      <Tabs value={tab} onChange={(v) => setParams(v === "access" ? { tab: "access" } : {})}>
        <Tabs.List mb="lg">
          <Tabs.Tab value="run" leftSection={<IconPlayerPlay size={16} />}>
            Run backtest
          </Tabs.Tab>
          <Tabs.Tab value="access" leftSection={<IconUsers size={16} />}>
            User access
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="run">
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {strategies.map((s) => (
              <Card
                key={s.path}
                withBorder
                radius="md"
                padding="lg"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(s.path)}
              >
                <Group justify="space-between" mb="sm">
                  <ThemeIcon size={42} radius="md" variant="light">
                    <IconChartCandle size={24} />
                  </ThemeIcon>
                  <IconArrowRight size={20} color="gray" />
                </Group>

                <Text fw={600} mb={6} style={{ wordBreak: "break-word" }}>
                  {s.title}
                </Text>
                <Text size="sm" c="dimmed" mb="md">
                  {s.description}
                </Text>

                <Group gap={6}>
                  {s.tags.map((t) => (
                    <Badge key={t} variant="light" size="sm">
                      {t}
                    </Badge>
                  ))}
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="access">{tab === "access" && <BacktestAccess />}</Tabs.Panel>
      </Tabs>
    </Box>
  );
};

export default Backtest;
