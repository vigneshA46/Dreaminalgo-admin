import React, { useEffect, useState } from "react";
import { Alert, Center, Loader, Paper, Tabs, Text } from "@mantine/core";
import { CandleChart } from "./CandleChart";

/** The day's charts (index and the traded options) as tabs. Drawn from the backtest's own candles, never stored. */
export const DayCharts = ({ charts }) => {
  if (!charts?.length) return null;
  return (
    <Paper withBorder radius="md" p="md">
      <Text fw={600} mb={2}>
        Charts
      </Text>
      <Text size="xs" c="dimmed" mb="sm">
        Built from the same candles the backtest used: indicators, buy / sell signals and exits. Hover for values, use the buttons to zoom and move.
      </Text>
      <Tabs defaultValue={charts[0].id} keepMounted={false}>
        <Tabs.List mb="sm" style={{ flexWrap: "nowrap", overflowX: "auto" }}>
          {charts.map((c) => (
            <Tabs.Tab key={c.id} value={c.id} style={{ whiteSpace: "nowrap" }}>
              {c.title}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {charts.map((c) => (
          <Tabs.Panel key={c.id} value={c.id}>
            {c.subtitle && (
              <Text size="xs" c="dimmed" mb={4}>
                {c.subtitle}
              </Text>
            )}
            <CandleChart spec={c} />
          </Tabs.Panel>
        ))}
      </Tabs>
    </Paper>
  );
};

/** charts of one day of a range run, fetched when the day is opened (they are kept on the server for the run only) */
export const LazyDayCharts = ({ date, load }) => {
  const [state, setState] = useState({ loading: true, charts: null, error: null });
  useEffect(() => {
    let alive = true;
    load(date)
      .then((charts) => alive && setState({ loading: false, charts, error: null }))
      .catch((e) => alive && setState({ loading: false, charts: null, error: e?.response?.data?.message || "Could not load the charts for this day (the run may have expired)" }));
    return () => {
      alive = false;
    };
  }, [date, load]);
  if (state.loading) {
    return (
      <Center py="md">
        <Loader size="sm" />
      </Center>
    );
  }
  if (state.error) return <Alert color="yellow">{state.error}</Alert>;
  return <DayCharts charts={state.charts} />;
};
