import React from "react";
import { Group, NumberInput, Paper, SegmentedControl, SimpleGrid, Stack, Switch, Text } from "@mantine/core";
import { HOURLY_LIMITS } from "./hourlyOptions";

/** Settings for nifty_hourly_range_touch_custom: candle timeframe + day / cycle SL and profit. */
export const HourlyOptionsForm = ({ value, onChange, disabled }) => {
  const set = (key, patch) => onChange({ ...value, [key]: { ...value[key], ...patch } });

  return (
    <Paper withBorder radius="md" p="sm" bg="var(--mantine-color-gray-0)">
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }} spacing="md">
        <Stack gap={4}>
          <Text size="sm" fw={500}>
            Timeframe
          </Text>
          <SegmentedControl
            value={String(value.timeframe)}
            onChange={(v) => onChange({ ...value, timeframe: Number(v) })}
            data={[
              { label: "1m", value: "1" },
              { label: "3m", value: "3" },
              { label: "5m", value: "5" },
            ]}
            disabled={disabled}
            fullWidth
          />
        </Stack>

        {HOURLY_LIMITS.map(([key, label, hint]) => (
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
              error={value[key].enabled && !(Number(value[key].value) > 0) ? "Enter an amount" : null}
            />
          </Stack>
        ))}
      </SimpleGrid>
    </Paper>
  );
};
