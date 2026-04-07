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
  TextInput,
  Title,
  SegmentedControl
} from "@mantine/core";

import {
  IconCopy,
  IconTrash,
  IconInfoCircle
} from "@tabler/icons-react";
import { TimeInput } from "@mantine/dates";

export default function Createleg({ leg, updateLeg }) {
  const [marketType , setMarketType] = useState("");
  const [targetProfit, setTargetProfit] = useState(false);
  const [stopLoss, setStopLoss] = useState(false);
  const [trailSL, setTrailSL] = useState(false);
  const [reentryTgt, setReentryTgt] = useState(false);
  const [reentrySL, setReentrySL] = useState(false);
  const [momentum, setMomentum] = useState(false);
  const [rangeBreakout, setRangeBreakout] = useState(false);

  const [entryType, setEntryType] = useState("Current Price");

const [slEnabled, setSlEnabled] = useState(false);
const [slType, setSlType] = useState("limit");

const [reentrySLCount, setReentrySLCount] = useState(1);

const [targetType, setTargetType] = useState("mtm");

const [reentryTarget, setReentryTarget] = useState(false);
const [reentryTargetCount, setReentryTargetCount] = useState(1);
const [targetEnabled, setTargetEnabled] = useState(false);
const [trailingEnabled, setTrailingEnabled] = useState(false);
const [reentryTSL, setReentryTSL] = useState(false);

  const expiryOptions =
    marketType === "futures"
      ? ["Current Month", "Next Month"]
  : ["This Week", "Next Week"];

  const strikeTypeOptions = [
  { label: "ATM Spot", value: "atm_spot" },
  { label: "ATM Futures", value: "atm_futures" },
  { label: "Premium Nearest", value: "premium_nearest" },
  { label: "Premium <", value: "premium_lt" },
  { label: "Premium >", value: "premium_gt" },
  { label: "Delta Nearest", value: "delta_nearest" },
  { label: "Delta <", value: "delta_lt" },
  { label: "Delta >", value: "delta_gt" }
];

const atmValueOptions = [
  { label: "ATM", value: "ATM" },
  { label: "ITM 0", value: "ITM0" },
  { label: "ITM 1", value: "ITM1" },
  { label: "OTM 0", value: "OTM0" },
  { label: "OTM 1", value: "OTM1" }
];

  return (
    <Card shadow="xs" radius="md" p="lg" withBorder>

      <Grid>
  {/* Market Type */}
  <Grid.Col span={{ base: 12, md: 2 }}>
    <Text fw={500} size="0.9rem" mb="0.5rem">
      Market Type
    </Text>

    <SegmentedControl
      fullWidth
      value={leg.market_type}
      onChange={(val) => updateLeg(leg.id, "market_type", val)}
      data={[
        { label: "Futures", value: "futures" },
        { label: "Options", value: "options" }
      ]}
    />
  </Grid.Col>
</Grid>

      {/* Main Inputs */}
      {/* Main Inputs */}
<Grid align="flex-end">

  {/* LOTS */}
  <Grid.Col span={{ base: 12, md: 2 }}>
    <NumberInput
      label="Lots"
      min={1}
      value={leg.lots}
      onChange={(val) => updateLeg(leg.id, "lots", val)}
    />
  </Grid.Col>

  {/* POSITION */}
  <Grid.Col span={{ base: 12, md: 2 }}>
    <Select
      label="Position"
      data={["Buy", "Sell"]}
      value={leg.position}
      onChange={(val) => updateLeg(leg.id, "position", val)}
    />
  </Grid.Col>

  {/* OPTION TYPE */}
  {leg.market_type === "options" && (
    <Grid.Col span={{ base: 12, md: 2 }}>
      <Select
        label="Option Type"
        data={["Call", "Put"]}
        value={leg.option_type}
        onChange={(val) => updateLeg(leg.id, "option_type", val)}
      />
    </Grid.Col>
  )}

  {/* EXPIRY */}
  <Grid.Col span={{ base: 12, md: 2 }}>
    <Select
      label="Expiry"
      data={
        leg.market_type === "futures"
          ? ["Current Month", "Next Month"]
          : ["This Week", "Next Week"]
      }
      value={leg.expiry}
      onChange={(val) => updateLeg(leg.id, "expiry", val)}
    />
  </Grid.Col>

  {/* STRIKE SELECTION */}
  {leg.market_type === "options" && (
    <Grid.Col span={{ base: 12, md: 4 }}>

      <Group align="center" gap={4}>
        <Text size="sm">Strike Selection</Text>
        <IconInfoCircle size={14} />
      </Group>

      <Group grow>

        {/* Strike Type */}
        <Select
          data={strikeTypeOptions}
          value={leg.strike_type.type}
          onChange={(val) =>
            updateLeg(leg.id, "strike_type.type", val)
          }
        />

        {/* Strike Value */}

        {(leg.strike_type.type === "atm_spot" ||
          leg.strike_type.type === "atm_futures") ? (

          <Select
            data={atmValueOptions}
            value={leg.strike_type.value}
            onChange={(val) =>
              updateLeg(leg.id, "strike_type.value", val)
            }
          />

        ) : (

          <NumberInput
            placeholder="Value"
            value={leg.strike_type.value}
            onChange={(val) =>
              updateLeg(leg.id, "strike_type.value", val)
            }
          />

        )}

      </Group>

    </Grid.Col>
  )}

</Grid>


    <Title order={6} my="sm">
        Leg Settings
      </Title>
      <Grid mb={"1rem"} >
         {/* ENTRY TYPE */}


        <Grid.Col span={{ base: 12, md: 4 }}>
      <Card shadow="sm">

        <Group justify="space-between">
          <span>Entry Type</span>
        </Group>

        <Select
          mt="md"
          data={["Time", "Current Price", "Limit Price"]}
          value={entryType}
          onChange={setEntryType}
        />

        {/* TIME INPUT */}
        {entryType === "Time" && (
          <TimeInput
            mt="md"
            label="Entry Time"
          />
        )}

        {/* LIMIT PRICE INPUT */}
        {entryType === "Limit Price" && (
          <TextInput
            mt="md"
            label="Value"
            placeholder="Enter Limit Price"
            type="number"
          />
        )}

        {/* CURRENT PRICE -> NOTHING */}
      </Card>
    </Grid.Col>
      </Grid>

       <Grid>


       

{/* SL TYPE */}

<Grid.Col span={{ base: 12, md: 4 }}>
  <Card shadow="sm" p="lg">

    <Group justify="space-between">
      <Text>SL Type</Text>

      <Switch
        checked={leg.stoploss.enabled}
        onChange={(e) =>
          updateLeg(
            leg.id,
            "stoploss.enabled",
            e.currentTarget.checked
          )
        }
      />
    </Group>

    {leg.stoploss.enabled && (
      <>
        <Select
          mt="md"
          value={leg.stoploss.type}
          onChange={(val) =>
            updateLeg(leg.id, "stoploss.type", val)
          }
          data={[
            { label: "Time", value: "time" },
            { label: "Percentage", value: "percentage" },
            { label: "Limit Price", value: "limit" },
            { label: "MTM", value: "mtm" }
          ]}
        />

        {/* TIME */}
        {leg.stoploss.type === "time" && (
          <TimeInput
            mt="md"
            label="Exit Time"
            onChange={(val) =>
              updateLeg(leg.id, "stoploss.value", val)
            }
          />
        )}

        {/* LIMIT PRICE */}
        {leg.stoploss.type === "limit" && (
          <NumberInput
            mt="md"
            label="Limit Price"
            value={leg.stoploss.value}
            onChange={(val) =>
              updateLeg(leg.id, "stoploss.value", val)
            }
          />
        )}

        {/* PERCENTAGE */}
        {leg.stoploss.type === "percentage" && (
          <NumberInput
            mt="md"
            label="Percentage"
            value={leg.stoploss.value}
            onChange={(val) =>
              updateLeg(leg.id, "stoploss.value", val)
            }
            rightSection="%"
          />
        )}

        {/* MTM */}
        {leg.stoploss.type === "mtm" && (
          <NumberInput
            mt="md"
            label="MTM Value"
            value={leg.stoploss.value}
            onChange={(val) =>
              updateLeg(leg.id, "stoploss.value", val)
            }
          />
        )}

        {/* REENTRY */}

        <Group mt="1rem" justify="space-between">
          <Text>Re-entry after SL</Text>

          <Switch
            checked={leg.stoploss.reentry.enabled}
            onChange={(e) =>
              updateLeg(
                leg.id,
                "stoploss.reentry.enabled",
                e.currentTarget.checked
              )
            }
          />
        </Group>

        {leg.stoploss.reentry.enabled && (
          <NumberInput
            mt="sm"
            label="Re-entry Count"
            min={1}
            value={leg.stoploss.reentry.count}
            onChange={(val) =>
              updateLeg(
                leg.id,
                "stoploss.reentry.count",
                val
              )
            }
          />
        )}
      </>
    )}

  </Card>
</Grid.Col>


{/* TARGET TYPE */}

<Grid.Col span={{ base: 12, md: 4 }}>
  <Card shadow="sm" p="lg">

    <Group justify="space-between">
      <Text>Target Type</Text>

      <Switch
        checked={leg.target.enabled}
        onChange={(e) =>
          updateLeg(
            leg.id,
            "target.enabled",
            e.currentTarget.checked
          )
        }
      />
    </Group>

    {leg.target.enabled && (
      <>
        <Select
          mt="md"
          value={leg.target.type}
          onChange={(val) =>
            updateLeg(leg.id, "target.type", val)
          }
          data={[
            { label: "Time", value: "time" },
            { label: "MTM", value: "mtm" },
            { label: "Limit Price", value: "limit" },
            { label: "Percentage", value: "percentage" }
          ]}
        />

        {/* TIME */}
        {leg.target.type === "time" && (
          <TimeInput
            mt="md"
            label="Target Time"
            onChange={(val) =>
              updateLeg(leg.id, "target.value", val)
            }
          />
        )}

        {/* MTM */}
        {leg.target.type === "mtm" && (
          <NumberInput
            mt="md"
            label="MTM Target"
            value={leg.target.value}
            onChange={(val) =>
              updateLeg(leg.id, "target.value", val)
            }
          />
        )}

        {/* LIMIT PRICE */}
        {leg.target.type === "limit" && (
          <NumberInput
            mt="md"
            label="Limit Price"
            value={leg.target.value}
            onChange={(val) =>
              updateLeg(leg.id, "target.value", val)
            }
          />
        )}

        {/* PERCENTAGE */}
        {leg.target.type === "percentage" && (
          <NumberInput
            mt="md"
            label="Percentage"
            value={leg.target.value}
            onChange={(val) =>
              updateLeg(leg.id, "target.value", val)
            }
          />
        )}

        {/* REENTRY */}

        <Group mt="1rem" justify="space-between">
          <Text>Re-entry after Target</Text>

          <Switch
            checked={leg.target.reentry.enabled}
            onChange={(e) =>
              updateLeg(
                leg.id,
                "target.reentry.enabled",
                e.currentTarget.checked
              )
            }
          />
        </Group>

        {leg.target.reentry.enabled && (
          <NumberInput
            mt="sm"
            label="Re-entry Count"
            min={1}
            value={leg.target.reentry.count}
            onChange={(val) =>
              updateLeg(
                leg.id,
                "target.reentry.count",
                val
              )
            }
          />
        )}

      </>
    )}

  </Card>
</Grid.Col>


  {/* TRAILING */}

<Grid.Col span={{ base: 12, md: 4 }}>
  <Card shadow="sm" p="lg">

    <Group justify="space-between">
      <Text>Trailing Options</Text>

      <Switch
        checked={leg.trailing.enabled}
        onChange={(e) =>
          updateLeg(
            leg.id,
            "trailing.enabled",
            e.currentTarget.checked
          )
        }
      />
    </Group>

    {leg.trailing.enabled && (
      <>
        {/* TRAILING TYPE */}

        <Select
          mt="md"
          value={leg.trailing.type}
          onChange={(val) =>
            updateLeg(leg.id, "trailing.type", val)
          }
          data={[
            { label: "MTM", value: "mtm" },
            { label: "Points", value: "points" },
            { label: "Percentage", value: "percentage" }
          ]}
        />

        {/* TSL ACTIVE */}

        <NumberInput
          mt="sm"
          label="TSL Active"
          value={leg.trailing.tsl_active}
          onChange={(val) =>
            updateLeg(leg.id, "trailing.tsl_active", val)
          }
        />

        {/* SL POSITION */}

        <NumberInput
          mt="sm"
          label="SL Position"
          value={leg.trailing.sl_position}
          onChange={(val) =>
            updateLeg(leg.id, "trailing.sl_position", val)
          }
        />

        {/* TRAIL VALUE */}

        <NumberInput
          mt="sm"
          label="Trail Value"
          value={leg.trailing.trail_value}
          onChange={(val) =>
            updateLeg(leg.id, "trailing.trail_value", val)
          }
        />

        {/* REENTRY */}

        <Group mt="1rem" justify="space-between">
          <Text>Re-entry after TSL</Text>

          <Switch
            checked={leg.trailing.reentry.enabled}
            onChange={(e) =>
              updateLeg(
                leg.id,
                "trailing.reentry.enabled",
                e.currentTarget.checked
              )
            }
          />
        </Group>

        {leg.trailing.reentry.enabled && (
          <NumberInput
            mt="sm"
            label="Re-entry Number"
            min={1}
            value={leg.trailing.reentry.count}
            onChange={(val) =>
              updateLeg(
                leg.id,
                "trailing.reentry.count",
                val
              )
            }
          />
        )}

      </>
    )}

  </Card>
</Grid.Col>
                  </Grid>


    </Card>
  );
}