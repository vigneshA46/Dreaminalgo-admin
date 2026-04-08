import React, { useEffect, useState } from 'react';
import { MantineProvider, Box, Container, Group, Button, TextInput, Radio, Text, Card, Badge, Anchor, Grid, Stack } from '@mantine/core';
import { IconSearch, IconCurrencyRupee } from '@tabler/icons-react';
import { apiRequest } from './utils/api';
import { Modal, Switch } from "@mantine/core";



const Stratergies = () => {
  const [activeTab, setActiveTab] = useState('marketplace');
  const [selectedFee, setSelectedFee] = useState('');
  const [selectedSort, setSelectedSort] = useState('');
  const [strategies , setstrategies] = useState([])
  const [mystartergieslist , setmystartergieslist] = useState([]);
  const [opened, setOpened] = useState(false);
const [selectedStrategy, setSelectedStrategy] = useState(null);
const [useropened, setuserOpened] = useState(false);
const [userselectedStrategy, setuserSelectedStrategy] = useState(null);
const [form, setForm] = useState({
  name: "",
  description: "",
  capitalRequired: "",
  tokensRequired: "",
  isPaid: false
});

const handleView = (strategy) => {
  setuserSelectedStrategy(strategy);
  setuserOpened(true);
};

const handleDelete = async (id) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this strategy?");

  if (!confirmDelete) return;

  try {
    await deleteuserstratergy(id);
    // refresh your list here
  } catch (err) {
    console.log(err);
  }
};


const deleteuserstratergy  = async (id)=>{
  try{
    const res =await apiRequest('DELETE',`/api/createstartergy/${id}`)
    console.log(res)
  }catch(err){
    console.log(err)
  }
}

  useEffect(()=>{
    const fetchuserstratergies = async ()=>{
      try {
        const res = await apiRequest('POST','/api/createstartergy/all')

        console.log(res)
        setmystartergieslist(res)
      }catch(err){
        console.log(err)
      }
    }
    fetchuserstratergies();
  },[])

  const SingleTraderSignal = ({
    startergyname,
    timestamp,
    description,
    onDelete,
    onView
  }) => {
    return (
      <Card
        radius="md"
        withBorder
        p="lg"
        style={{
          borderColor: "#e5e5e5",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Content */}
        <Stack gap={6}>
          <Text fw={600} size="md">
            {startergyname}
          </Text>
  
          <Text size="xs" c="dimmed">
            {timestamp}
          </Text>
  
          <Text size="sm" c="black">
            {description}
          </Text>
        </Stack>
  
        {/* Buttons */}
        <Group mt="lg" grow px={"1rem"}>
          <Button
          radius={"0.4rem"}
            styles={{
              root: {
                border:"1px solid #a0a0a0",
                backgroundColor: "#fff",
                color: "#000",
              },
            }}
            onClick={onView}
          >
            View
          </Button>
          <Button
          color="black"
          onClick={onDelete}
        >
          Delete
        </Button>
        </Group>
      </Card>
    );
  };

      const fetchStratergy = async ()=>{
      try {
        const strategies = await apiRequest("GET","/api/stratergy")
        /* console.log(strategies) */
        await setstrategies(strategies)
      }
      catch(err){
        console.log(err)
      }
    }


  
  useEffect(()=>{
    fetchStratergy();
  },[])

  
  return (
     <Box style={{ backgroundColor: '#ffffffff', minHeight: '100vh' }}>
        <Container size="xl" style={{ maxWidth: '1400px' }}>
      <Text size='1.5rem' fw={"600"} pb={"1rem"} >Stratergies</Text>
          {/* Tabs */}
          <Group gap="md" mb="xl">
            <Button
              size="md"
              radius="xl"
              style={{
                backgroundColor: activeTab === 'marketplace' ? '#000000ff' : 'transparent',
                color: activeTab === 'marketplace' ? 'white' : '#495057',
                border: 'none',
                fontWeight: 500,
                paddingLeft: '28px',
                paddingRight: '28px',
              }}
              onClick={() => setActiveTab('marketplace')}
            >
              Admin Strategies
            </Button>
            <Button
              size="md"
              radius="xl"
              variant="subtle"
              style={{
                backgroundColor: activeTab === 'myStrategies' ? '#000000ff' : 'transparent',
                color: activeTab === 'myStrategies' ? 'white' : '#495057',
                border: 'none',
                fontWeight: 500,
                paddingLeft: '28px',
                paddingRight: '28px',
              }}
              onClick={() => setActiveTab('myStrategies')}
            >
              User Strategies
            </Button>
          </Group>
          {
            activeTab == 'marketplace' ? (
                <Grid gutter="lg">
            {/* Left Sidebar - Filters */}
            <Grid.Col span={{ base: 12, md: 3 }}>
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e9ecef',
                }}
              >
                {/* Search */}
                <TextInput
                  placeholder="Search"
                  leftSection={<IconSearch size={18} />}
                  radius="md"
                  mb="xl"
                  styles={{
                    input: {
                      border: '1px solid #dee2e6',
                    },
                  }}
                />

                {/* Fixed Fee */}
                <Box mb="xl">
                  <Text size="sm" fw={600} mb="md" c="#212529">
                    Fixed Fee
                  </Text>
                  <Radio.Group value={selectedFee} onChange={setSelectedFee}>
                    <Radio
                      value="free"
                      label="Free"
                      mb="sm"
                      styles={{
                        radio: { cursor: 'pointer' },
                        label: { cursor: 'pointer', color: '#495057' },
                      }}
                    />
                    <Radio
                      value="paid"
                      label="Paid"
                      styles={{
                        radio: { cursor: 'pointer' },
                        label: { cursor: 'pointer', color: '#495057' },
                      }}
                    />
                  </Radio.Group>
                </Box>

                {/* Sort By */}
                <Box mb="xl">
                  <Text size="sm" fw={600} mb="md" c="#212529">
                    Sort By
                  </Text>
                  <Radio.Group value={selectedSort} onChange={setSelectedSort}>
                    <Radio
                      value="minCapital"
                      label="Min Capital"
                      mb="sm"
                      styles={{
                        radio: { cursor: 'pointer' },
                        label: { cursor: 'pointer', color: '#495057' },
                      }}
                    />
                    <Radio
                      value="minFees"
                      label="Min Fees"
                      mb="sm"
                      styles={{
                        radio: { cursor: 'pointer' },
                        label: { cursor: 'pointer', color: '#495057' },
                      }}
                    />
                    <Radio
                      value="latest"
                      label="Latest"
                      styles={{
                        radio: { cursor: 'pointer' },
                        label: { cursor: 'pointer', color: '#495057' },
                      }}
                    />
                  </Radio.Group>
                </Box>

                {/* Filter Button */}
                <Button
                  fullWidth
                  size="md"
                  radius="md"
                  mb="sm"
                  style={{
                    backgroundColor: '#000000ff',
                    fontWeight: 500,
                  }}
                >
                  FILTER
                </Button>

                {/* Reset Button */}
                <Button
                  fullWidth
                  size="md"
                  radius="md"
                  variant="outline"
                  style={{
                    borderColor: '#dee2e6',
                    color: '#495057',
                    fontWeight: 500,
                  }}
                >
                  RESET
                </Button>
              </Card>
            </Grid.Col>

            {/* Right Content - Strategy Cards */}
            <Grid.Col span={{ base: 12, md: 9 }}>
              {strategies.map((strategy) => (
                <Card
                my={'1rem'}
  key={strategy.id}
  onClick={() => {
    setSelectedStrategy(strategy);
    setForm({
      name: strategy.name,
      description: strategy.description,
      capitalRequired: strategy.capital_required,
      tokensRequired: strategy.tokens_required,
      isPaid: strategy.is_paid
    });
    setOpened(true);
  }}
  style={{
    cursor: "pointer",
    backgroundColor: "white",
    border: "1px solid #e9ecef"
  }}
>
                  <Group justify="space-between" align="flex-start" mb="md">
                    <Box style={{ flex: 1 }}>
                      <Text size="lg" fw={600} c="#212529" mb={8}>
                        {strategy.name}
                      </Text>
                      <Text size="sm" c="#495057" mb={8}>
                        {strategy.description}
                        <Anchor
                          href="#"
                          size="sm"
                          style={{ color: '#1864ab', marginLeft: '4px' }}
                        >
                          ...read more.
                        </Anchor>
                      </Text>
                    </Box>
                    
                  </Group>

                  <Group justify="space-between" align="center">
                    <Group gap="xl">
                      <Box>
                        <Text size="xs" c="#868e96" mb={4}>
                          Capital
                        </Text>
                        <Group gap={4} align="center">
                          <IconCurrencyRupee size={18} color="#dc3545" stroke={2} />
                          <Text size="lg" fw={700} c="#dc3545">
                            {strategy.capital_required}
                          </Text>
                        </Group>
                      </Box>
                     {/*  <Box>
                        <Text size="xs" c="#868e96" mb={4}>
                          DD
                        </Text>
                        <Text size="lg" fw={700} c="#1864ab">
                          {strategy.dd}
                        </Text>
                      </Box> */}
                    </Group>

                    
                  </Group>
                </Card> 
              ))}
            </Grid.Col>
          </Grid>
            ) : (
              <Grid>
                    {mystartergieslist.map((signal) => (
                      <Grid.Col
                        key={signal.id}
                        span={{ base: 12, sm: 6, md: 4, lg: 6 }}
                      >
                        <SingleTraderSignal
                        startergyname={signal.startergy_name}
                        description={signal.description}
                        timestamp={signal.created_at}
                        onView={() => handleView(signal)}
                        onDelete={() => handleDelete(signal.id)}
                        />    
                      </Grid.Col>
                    ))}
                  </Grid>
            )
          }

        
        </Container>
        <Modal
  opened={opened}
  onClose={() => setOpened(false)}
  title="Update Strategy"
  centered
>
  <Stack>
    <TextInput
      label="Name"
      value={form.name}
      onChange={(e) => setForm({ ...form, name: e.target.value })}
    />

    <TextInput
      label="Description"
      value={form.description}
      onChange={(e) =>
        setForm({ ...form, description: e.target.value })
      }
    />

    <TextInput
      label="Capital Required"
      value={form.capitalRequired}
      onChange={(e) =>
        setForm({ ...form, capitalRequired: e.target.value })
      }
    />

    <TextInput
      label="Tokens Required"
      value={form.tokensRequired}
      onChange={(e) =>
        setForm({ ...form, tokensRequired: e.target.value })
      }
    />

    <Switch
      label="Paid Strategy"
      checked={form.isPaid}
      onChange={(e) =>
        setForm({ ...form, isPaid: e.currentTarget.checked })
      }
    />

    <Button
      fullWidth
      style={{ backgroundColor: "black", color: "white" }}
      onClick={async () => {
        try {
          await apiRequest(
            "PATCH",
            `/api/stratergy/${selectedStrategy.id}`,
            form
          );

          setOpened(false);

          // 🔥 Refresh list
          fetchStratergy();

        } catch (err) {
          console.log(err);
        }
      }}
    >
      Update Strategy
    </Button>
  </Stack>
</Modal>

<Modal
  opened={useropened}
  onClose={() => setuserOpened(false)}
  title="Strategy Details"
  size="lg"
>
  {userselectedStrategy && (
    <Stack>

      <Text fw={600}>Name:</Text>
      <Text>{userselectedStrategy.startergy_name}</Text>

      <Text fw={600}>Description:</Text>
      <Text>{userselectedStrategy.description || "N/A"}</Text>

      <Text fw={600}>Created At:</Text>
      <Text>{userselectedStrategy.created_at}</Text>

      {/* ENTRY SETTINGS */}
      <Text fw={700} mt="md">Entry Settings</Text>
      <pre style={{ background: "#f8f9fa", padding: "10px" }}>
        {JSON.stringify(userselectedStrategy.entry_settings, null, 2)}
      </pre>

      {/* LEGS */}
      <Text fw={700} mt="md">Legs</Text>

      {userselectedStrategy.config_json?.legs?.map((leg, index) => (
        <Card key={leg.id} withBorder mt="sm">
          <Text fw={600}>Leg {index + 1}</Text>

          <pre style={{ fontSize: "12px" }}>
            {JSON.stringify(leg, null, 2)}
          </pre>
        </Card>
      ))}

    </Stack>
  )}
</Modal>
      </Box>
  )
}

export default Stratergies