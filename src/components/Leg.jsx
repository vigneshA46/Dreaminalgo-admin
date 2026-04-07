import { useState } from "react";
import {
  Card,
  Grid,
  Group,
  Select,
  NumberInput,
  Text,
  Switch,
  Button,
  ActionIcon,
  TextInput
} from "@mantine/core";

import {
  IconCopy,
  IconTrash,
  IconInfoCircle
} from "@tabler/icons-react";

export default function Leg({
  segment = "options",
  lots = 1,
  position = "Sell",
  option_type="Call",
  strike_price = "",
  expiry = "",
  number=1
}) {
  const [marketType] = useState(segment);

  const [targetProfit, setTargetProfit] = useState(false);
  const [stopLoss, setStopLoss] = useState(false);
  const [trailSL, setTrailSL] = useState(false);
  const [reentryTgt, setReentryTgt] = useState(false);
  const [reentrySL, setReentrySL] = useState(false);
  const [momentum, setMomentum] = useState(false);
  const [rangeBreakout, setRangeBreakout] = useState(false);

  const expiryOptions =
    marketType === "futures"
      ? ["Current Month", "Next Month"]
      : ["Weekly", "Monthly"];

  return (
    <Card shadow="xs" radius="md" p="lg" withBorder>

      {/* Header */}
      <Group justify="space-between" mb="md">
        <Text fw={600}>#{number}</Text>

      </Group>

      {/* Main Inputs */}
      <Grid align="flex-end">

        <Grid.Col span={{ base: 12, md: 2 }}>
          <NumberInput label="Lots" defaultValue={lots} min={1} />
        </Grid.Col>

        {marketType === "options" && (
          <Grid.Col span={{ base: 12, md: 2 }}>
            <Select
              label="Position"
              data={["Buy", "Sell"]}
              defaultValue={position}
            />
          </Grid.Col>
        )}

        {marketType === "options" && (
          <Grid.Col span={{ base: 12, md: 2 }}>
            <Select
              label="Option Type"
              data={["Call", "Put"]}
              defaultValue={option_type}
            />
          </Grid.Col>
        )}

        <Grid.Col span={{ base: 12, md: 2 }}>
          <Select
            label="Expiry"
            data={expiryOptions}
            defaultValue={expiry || expiryOptions[0]}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 3 }}>
          <Group align="center" gap={4}>
            <Text size="sm">Strike Price</Text>
            <IconInfoCircle size={14} />
          </Group>

          <Group grow>
            <TextInput type="number" value={strike_price} />
          </Group>
        </Grid.Col>

      </Grid>

      {/* Profit / SL */}
      <Grid mt="md">

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Group justify="space-between">
            <Text size="sm">Target Profit</Text>
            <Switch
              checked={targetProfit}
              onChange={(e) => setTargetProfit(e.currentTarget.checked)}
            />
          </Group>

          {targetProfit && (
            <Group mt="xs">
              <Select data={["Points (Pts)", "Percent"]} defaultValue="Points (Pts)" />
              <NumberInput placeholder="0" />
            </Group>
          )}
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Group justify="space-between">
            <Text size="sm">Stop Loss</Text>
            <Switch
              checked={stopLoss}
              onChange={(e) => setStopLoss(e.currentTarget.checked)}
            />
          </Group>

          {stopLoss && (
            <Group mt="xs">
              <Select data={["Points (Pts)", "Percent"]} defaultValue="Points (Pts)" />
              <NumberInput placeholder="0" />
            </Group>
          )}
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Group justify="space-between">
            <Group gap={4}>
              <Text size="sm">Trail SL</Text>
              <IconInfoCircle size={14} />
            </Group>

            <Switch
              checked={trailSL}
              onChange={(e) => setTrailSL(e.currentTarget.checked)}
            />
          </Group>

          {trailSL && (
            <Group mt="xs">
              <Select data={["Points"]} defaultValue="Points" />
              <NumberInput placeholder="0" />
              <NumberInput placeholder="0" />
            </Group>
          )}
        </Grid.Col>

      </Grid>

      {/* Advanced Settings */}
      <Grid mt="md">

        <Grid.Col span={{ base: 12, md: 3 }}>
          <Group justify="space-between">
            <Text size="sm">Re-entry on Tgt</Text>
            <Switch
              checked={reentryTgt}
              onChange={(e) => setReentryTgt(e.currentTarget.checked)}
            />
          </Group>

          {reentryTgt && (
            <Group mt="xs">
              <Select data={["RE ASAP"]} defaultValue="RE ASAP" />
              <NumberInput defaultValue={1} />
            </Group>
          )}
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 3 }}>
          <Group justify="space-between">
            <Text size="sm">Re-entry on SL</Text>
            <Switch
              checked={reentrySL}
              onChange={(e) => setReentrySL(e.currentTarget.checked)}
            />
          </Group>

          {reentrySL && (
            <Group mt="xs">
              <Select data={["RE ASAP"]} defaultValue="RE ASAP" />
              <NumberInput defaultValue={1} />
            </Group>
          )}
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 3 }}>
          <Group justify="space-between">
            <Group gap={4}>
              <Text size="sm">Simple Momentum</Text>
              <IconInfoCircle size={14} />
            </Group>

            <Switch
              checked={momentum}
              onChange={(e) => setMomentum(e.currentTarget.checked)}
            />
          </Group>

          {momentum && (
            <Group mt="xs">
              <Select data={["Points (Pts) ↑"]} />
              <NumberInput placeholder="0" />
            </Group>
          )}
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 3 }}>
          <Group justify="space-between">
            <Text size="sm">Range Breakout</Text>
            <Switch
              checked={rangeBreakout}
              onChange={(e) => setRangeBreakout(e.currentTarget.checked)}
            />
          </Group>

          {rangeBreakout && (
            <Group mt="xs">
              <TextInput placeholder="09:45" />
              <Select data={["High", "Low"]} defaultValue="High" />
              <Select data={["Strike Price"]} />
            </Group>
          )}
        </Grid.Col>

      </Grid>

    </Card>
  );
}