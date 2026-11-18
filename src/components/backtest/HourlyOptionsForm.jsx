import React from "react";
import { Group, NumberInput, Paper, SegmentedControl, Select, SimpleGrid, Stack, Switch, Text } from "@mantine/core";
import { HOURLY_LIMITS, HOURLY_STRIKES, touchBufferValid } from "./hourlyOptions";

/** Settings for nifty_hourly_range_touch_custom: candle timeframe, strike + day / cycle SL, profit and per-trade profit. */
export const HourlyOptionsForm = ({ value, onChange, disabled }) => {
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
            data={[
              { label: "1m", value: "1" },
              { label: "3m", value: "3" },
              { label: "5m", value: "5" },
            ]}
            disabled={disabled}
            fullWidth
          />
        </Stack>

        <Stack gap={4}>
          <Text size="sm" fw={500}>
            Strike
          </Text>
          <Select
            value={value.strike}
            onChange={(v) => v && onChange({ ...value, strike: v })}
            data={HOURLY_STRIKES}
            allowDeselect={false}
            disabled={disabled}
            aria-label="Strike at entry"
          />
          <Text size="xs" c="dimmed">
            From the signal candle's ATM. ITM: CE below, PE above.
          </Text>
        </Stack>

        <Stack gap={4}>
          <Text size="sm" fw={500}>
            Touch buffer
          </Text>
          <NumberInput
            value={value.touchBuffer}
            onChange={(v) => onChange({ ...value, touchBuffer: v })}
            min={0}
            max={100}
            step={0.5}
            decimalScale={2}
            rightSection={<Text size="xs" c="dimmed" pr={28}>pts</Text>}
            disabled={disabled}
            aria-label="Touch buffer in NIFTY points"
            error={touchBufferValid(value.touchBuffer) ? null : "0 to 100 points"}
          />
          <Text size="xs" c="dimmed">
            NIFTY within ± this of a High / Low line counts as a touch (arming and other-line exit).
          </Text>
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
