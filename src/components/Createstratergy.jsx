import {
  Container,
  Grid,
  Card,
  Group,
  Title,
  Button,
  Select,
  NumberInput,
  SegmentedControl,
  Switch,
  TextInput,
  Divider,
  Text,
  ActionIcon,
  Flex,
  Textarea
} from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { useEffect, useState } from "react";
import { IconCopy, IconTrash } from "@tabler/icons-react";
import Createleg from "./Createleg";
import { apiRequest } from "./utils/api";

export default function CreateStrategy() {

  const [indexes, setIndexes] = useState([])
  const [index, setIndex] = useState(null)
  const [description , setdescription] = useState("")
  const [startergyname , setstartergyname] = useState("")
  useEffect(() => {
  
    const fetchIndexes = async () => {
      try {
        const res = await apiRequest("GET", "/api/instruments/indexes")
        const formatted = res.map((item) => ({
          value: item.id,
          label: item.index_name
        }))
  
        setIndexes(formatted)
  
      } catch (err) {
        console.log("Index fetch error:", err)
      }
    }
  
    fetchIndexes()
  
  }, [])
  

    const createDefaultLeg = () => ({
  id: Date.now(),

  market_type: "options",

  lots: 1,
  position: "Sell",
  option_type: "Call",
  strike_type: {
    type: "ATM spot",
    value:""
  },
  expiry: "This Week",

  entry: {
    type: "current_price",
    value: null
  },

  stoploss: {
    enabled: false,
    type: "percentage",
    value: null,
    reentry: {
      enabled: false,
      count: 0
    }
  },

  target: {
    enabled: false,
    type: "mtm",
    value: null,
    reentry: {
      enabled: false,
      count: 0
    }
  },

  trailing: {
    enabled: false,
    type: "points",
    tsl_active: null,
    sl_position: null,
    trail_value: null,
    reentry: {
      enabled: false,
      count: 0
    }
  }
});

const [entrySettings, setEntrySettings] = useState({
  mode: "intraday",

  entry_time: null,
  exit_time: null,

  no_reentry_after: {
    enabled: false,
    time: null
  },

  delay_restart: {
    enabled: false,
    time: null
  },

  positional: {
    expiry_type: "weekly",
    entry_days_before_expiry: 0,
    exit_days_before_expiry: 0
  },

  momentum: {
    enabled: false,
    type: "points",
    value: 50
  }
});
  
  const updateLeg = (id, path, value) => {
  setLegs((prev) =>
    prev.map((leg) => {
      if (leg.id !== id) return leg;

      const keys = path.split(".");
      let updated = { ...leg };

      let obj = updated;

      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] };
        obj = obj[keys[i]];
      }

      obj[keys[keys.length - 1]] = value;

      return updated;
    })
  );
};

const handleSaveSignal = async() => {

  const signalJSON = {
    index: index,
    startergyname:startergyname,
    description : description,
    config_json: {
      entry_settings: entrySettings,
      legs: legs
    }
  };

  const response = await apiRequest('POST','/api/createstartergy/create',{
    index_id:index,
    startergy_name:startergyname,
    description: description,
    entry_settings: entrySettings,
    config_json: {legs:legs},
    status: 'published',
    created_by: 'user'
  })

  /* console.log(response) */

  /* console.log("FINAL SIGNAL JSON 👇"); */
  /* console.log(JSON.stringify(signalJSON, null, 2)); */
};

  const [mode, setMode] = useState("intraday");
  const [marketType, setMarketType] = useState("options");

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
  
    const [formData, setFormData] = useState({
    lots: 1,
    position: "Sell",
    option_type: "Call",
    strike_price: "",
    expiry: "This Week",
    strike_type: "",
    strike_value: ""
  });
  
    
    const expiryOptions =
    marketType === "futures"
    ? ["Current Month", "Next Month"]
    : ["This Week", "Next Week"];
    
    const [legs, setLegs] = useState([createDefaultLeg()]);
  
  
    const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };
  
  const addLeg = () => {
  setLegs((prev) => [...prev, createDefaultLeg()]);
};
  
  const deleteLeg = (id) => {
    setLegs((prev) => prev.filter((leg) => leg.id !== id));
  };
  
  const copyLeg = (leg) => {
  const newLeg = {
    ...JSON.parse(JSON.stringify(leg)),
    id: Date.now()
  };

  setLegs((prev) => [...prev, newLeg]);
};

  return (
    <Container size="xl" py="md">

      <Title order={3} pb={"1rem"} >Create Startergy</Title>
      <Grid justify={"space-around"} >

        {/* INSTRUMENT SETTINGS */}

        <Grid.Col span={{ base: 12, md: 4 }}>

          <Card shadow="sm" p="lg">
            <TextInput mb={'1rem'} value={startergyname} onChange={(e)=>setstartergyname(e.target.value)} label='Startegy Name' />
            <Select
              mb={"1rem"}
              label="Underlying"
              placeholder="Select index"
              data={indexes}
              value={index}
              onChange={setIndex}
              searchable
              nothingFoundMessage="No index found"
            />
            <Textarea label="Description" maxLength={300} value={description} onChange={(e)=>setdescription(e.target.value)} />
          </Card>
        </Grid.Col>

        {/* ENTRY SETTINGS */}

          <Grid.Col mb={"1rem"} span={{ base: 12, md: 6 }}>
      <Card shadow="sm" p="lg">

        <Title order={5} mb="md">
          Entry settings
        </Title>

        <SegmentedControl
          fullWidth
          value={entrySettings.mode}
          onChange={(val) =>
            setEntrySettings((prev) => ({
            ...prev,
              mode: val
              }))
            }
          data={[
            { label: "Intraday", value: "intraday" },
            { label: "BTST", value: "btst" },
            { label: "Positional", value: "positional" }
          ]}
        />

        {/* ---------- INTRADAY ---------- */}

        {mode === "intraday" && (
          <>
            <Grid mt="md">

              <Grid.Col span={6}>
                <TimeInput
  label="Entry Time"
  value={entrySettings.entry_time || ""}
  onChange={(e) =>
    setEntrySettings((prev) => ({
      ...prev,
      entry_time: e.currentTarget.value
    }))
  }
/>
              </Grid.Col>

              <Grid.Col span={6}>
                <TimeInput
  label="Exit Time"
  value={entrySettings.exit_time || ""}
  onChange={(e) =>
    setEntrySettings((prev) => ({
      ...prev,
      exit_time: e.currentTarget.value
    }))
  }
/>
              </Grid.Col>

            </Grid>

            <Group mt="md" align="end">
              <Switch
  label="No re-entry after"
  checked={entrySettings.no_reentry_after.enabled}
  onChange={(e) =>
    setEntrySettings((prev) => ({
      ...prev,
      no_reentry_after: {
        ...prev.no_reentry_after,
        enabled: e.currentTarget.checked
      }
    }))
  }
/>
              <TimeInput
  placeholder="Time"
  value={entrySettings.no_reentry_after.time || ""}
  onChange={(e) =>
    setEntrySettings((prev) => ({
      ...prev,
      no_reentry_after: {
        ...prev.no_reentry_after,
        time: e.currentTarget.value
      }
    }))
  }
/>
            </Group>
          </>
        )}

        {/* ---------- BTST ---------- */}

        {mode === "btst" && (
          <>
            <Grid mt="md">

              <Grid.Col span={6}>
               <TimeInput
  label="Entry Time"
  value={entrySettings.entry_time || ""}
  onChange={(e) =>
    setEntrySettings((prev) => ({
      ...prev,
      entry_time: e.currentTarget.value
    }))
  }
/>
              </Grid.Col>

              <Grid.Col span={6}>
                <TimeInput
  label="Exit Time"
  value={entrySettings.exit_time || ""}
  onChange={(e) =>
    setEntrySettings((prev) => ({
      ...prev,
      exit_time: e.currentTarget.value
    }))
  }
/>
              </Grid.Col>

            </Grid>

            <Group mt="md" align="end">
              <Switch
  label="Delay restart"
  checked={entrySettings.delay_restart.enabled}
  onChange={(e) =>
    setEntrySettings((prev) => ({
      ...prev,
      delay_restart: {
        ...prev.delay_restart,
        enabled: e.currentTarget.checked
      }
    }))
  }
/>
              <TimeInput
  placeholder="Time"
  value={entrySettings.delay_restart.time || ""}
  onChange={(e) =>
    setEntrySettings((prev) => ({
      ...prev,
      delay_restart: {
        ...prev.delay_restart,
        time: e.currentTarget.value
      }
    }))
  }
/>
            </Group>
          </>
        )}

        {/* ---------- POSITIONAL ---------- */}

        {mode === "positional" && (
          <>

            <Group mt="md">
              <Text>Position expiry on</Text>

              <Select
  w={140}
  value={entrySettings.positional.expiry_type}
  onChange={(val) =>
    setEntrySettings((prev) => ({
      ...prev,
      positional: {
        ...prev.positional,
        expiry_type: val
      }
    }))
  }
  data={[
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" }
  ]}
/>
            </Group>

            <Grid mt="md">

              <Grid.Col span={6}>
                <TimeInput
  label="Entry Time"
  value={entrySettings.entry_time || ""}
  onChange={(e) =>
    setEntrySettings((prev) => ({
      ...prev,
      entry_time: e.currentTarget.value
    }))
  }
/>
              </Grid.Col>

              <Grid.Col span={6}>
                <TimeInput
  label="Exit Time"
  value={entrySettings.exit_time || ""}
  onChange={(e) =>
    setEntrySettings((prev) => ({
      ...prev,
      exit_time: e.currentTarget.value
    }))
  }
/>
              </Grid.Col>

            </Grid>

            <Grid mt="md">

              <Grid.Col span={6}>
                <Group align="end">
                  <Select
  label="Entry"
  value={String(entrySettings.positional.entry_days_before_expiry)}
  onChange={(val) =>
    setEntrySettings((prev) => ({
      ...prev,
      positional: {
        ...prev.positional,
        entry_days_before_expiry: Number(val)
      }
    }))
  }
  data={["0","1","2","3","4"]}
/>
                  <Text mb={6}>trading days before expiry</Text>
                </Group>
              </Grid.Col>

              <Grid.Col span={6}>
                <Group align="end">
                  <Select
  label="Exit"
  value={String(entrySettings.positional.exit_days_before_expiry)}
  onChange={(val) =>
    setEntrySettings((prev) => ({
      ...prev,
      positional: {
        ...prev.positional,
        exit_days_before_expiry: Number(val)
      }
    }))
  }
  data={["0","1","2","3","4"]}
/>
                  <Text mb={6}>trading days before expiry</Text>
                </Group>
              </Grid.Col>

            </Grid>

            <Group mt="md" align="end">
              <Switch label="Delay restart" />
              <TimeInput placeholder="Time" />
            </Group>

          </>
        )}

        {/* ---------- COMMON SECTION ---------- */}

        <Divider my="md" />

        <Group justify="space-between">
          <Text>Overall Momentum</Text>
          <Switch
  checked={entrySettings.momentum.enabled}
  onChange={(e) =>
    setEntrySettings((prev) => ({
      ...prev,
      momentum: {
        ...prev.momentum,
        enabled: e.currentTarget.checked
      }
    }))
  }
/>
        </Group>

        <Group mt="sm">
          <Select
  value={entrySettings.momentum.type}
  onChange={(val) =>
    setEntrySettings((prev) => ({
      ...prev,
      momentum: {
        ...prev.momentum,
        type: val
      }
    }))
  }
  data={[
    { label: "Points (Pts)", value: "points" },
    { label: "Percentage", value: "percentage" }
  ]}
/>
          <NumberInput
  value={entrySettings.momentum.value}
  onChange={(val) =>
    setEntrySettings((prev) => ({
      ...prev,
      momentum: {
        ...prev.momentum,
        value: val
      }
    }))
  }
/>
        </Group>

      </Card>
    </Grid.Col>
        {/* LEGWISE SETTINGS */}
{/* 
        <Grid.Col span={{ base: 12, md: 3 }}>
          <Card shadow="sm" p="lg">

            <Title order={5} mb="md">
              Legwise settings
            </Title>

            <SegmentedControl
              fullWidth
              data={[
                { label: "Partial", value: "partial" },
                { label: "Complete", value: "complete" }
              ]}
            />

            <Switch
              mt="md"
              label="Trail SL to Break-even price"
            />

            <SegmentedControl
              mt="md"
              fullWidth
              data={[
                { label: "All Legs", value: "all" },
                { label: "SL Legs", value: "sl" }
              ]}
            />

          </Card>
        </Grid.Col> */}

      </Grid> 

            {/* LEG BUILDER */}
                    {legs.map((leg, index) => (
                      <Card key={leg.id} shadow="sm" p="sm" mt="md">
                    
                        <Group justify="space-between" mb="xs">
                    
                          <Text fw={600}>#{index + 1}</Text>
                    
                          {/* Only show icons after first leg */}
                            <Group>
                              <ActionIcon
                                variant="light"
                                onClick={() => copyLeg(leg)}
                                >
                                <IconCopy size={16} />
                              </ActionIcon>
                              {index !== 0 && (
                    
                              <ActionIcon
                                variant="light"
                                color="red"
                                onClick={() => deleteLeg(leg.id)}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            )}
                            </Group>
                    
                        </Group>
                    
                        <Createleg
                          leg={leg}
                          updateLeg={updateLeg}
                        />
                    
                        {/* Add Leg button only after first leg */}
                        {index === 0 && (
                          <Group justify="center" mt="md">
                            <Button bg="#000" onClick={addLeg}>
                              Add Leg
                            </Button>
                          </Group>
                        )}
                    
                      </Card>
                    ))}
                    


    
      {/* LOWER SECTION */}

          <Flex align={"center"} justify={"center"} >
        <Button bg="#000" onClick={handleSaveSignal}>
  Create Strategy
</Button>
        </Flex>
    </Container>
  );
}