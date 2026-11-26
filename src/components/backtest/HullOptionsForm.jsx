import React from "react";
import { Group, NumberInput, Paper, SegmentedControl, Select, SimpleGrid, Stack, Switch, Text } from "@mantine/core";
import { HULL_LIMITS, HULL_STRIKES, HULL_TIMEFRAMES } from "./hullOptions";

/** Settings for nifty_hull_ma_option_buying: candle timeframe, strike, day MTM target and day MTM SL. */
export const HullOptionsForm = ({ value, onChange, disabled, strikes = HULL_STRIKES, timeframeHint = "NIFTY candles the Hull MA 24 is drawn on.", showStrike = true }) => {
  const set = (key, patch) => onChange({ ...value, [key]: { ...value[key], ...patch } });

  return (
    <Paper withBorder radius="md" p="sm" bg="var(--mantine-color-gray-0)">
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        <Stack gap={4}>
          <Text size="sm" fw={500}>
            Timeframe
          </Text>
          <SegmentedControl
            value={String(value.timeframe)}
            onChange={(v) => onChange({ ...value, timeframe: Number(v) })}
            data={HULL_TIMEFRAMES.map((t) => ({ label: `${t}m`, value: String(t) }))}
            disabled={disabled}
            fullWidth
          />
          <Text size="xs" c="dimmed">
            {timeframeHint}
          </Text>
        </Stack>

        {showStrike && (
        <Stack gap={4}>
          <Text size="sm" fw={500}>
            Strike
          </Text>
          <Select
            value={value.strike}
            onChange={(v) => v && onChange({ ...value, strike: v })}
            data={strikes}
            allowDeselect={false}
            disabled={disabled}
            aria-label="Strike at entry"
          />
          <Text size="xs" c="dimmed">
            From the signal candle's ATM. ITM: CE below, PE above.
          </Text>
        </Stack>
        )}

        {HULL_LIMITS.map(([key, label, hint]) => (
          <Stack key={key} gap={4}>
            <Group justify="space-between" wrap="nowrap">
              <Text size="sm" fw={500}>
                {label}
              </Text>
              <Switch
                size="sm"
                checked={value[key].enabled}
                onChange={(e) => set(key, { enabled: e.currentTarget.checked })}
                disabled={disabled}
                aria-label={`Enable ${label}`}
              />
            </Group>
            <NumberInput
              value={value[key].value}
              onChange={(v) => set(key, { value: v })}
              disabled={disabled || !value[key].enabled}
              min={1}
              step={500}
              thousandSeparator=","
              leftSection="₹"
              placeholder={hint}
              aria-label={label}
              error={value[key].enabled && !(Number(value[key].value) > 0) ? "Enter an amount" : null}
            />
          </Stack>
        ))}
      </SimpleGrid>
    </Paper>
  );
};
