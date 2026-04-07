import React, { useEffect, useState } from 'react';
import { MantineProvider, Box, Container, Group, Button, TextInput, Radio, Text, Card, Badge, Anchor, Grid, Stack } from '@mantine/core';
import { IconSearch, IconCurrencyRupee } from '@tabler/icons-react';
import { apiRequest } from './utils/api';


const Stratergies = () => {
  const [activeTab, setActiveTab] = useState('marketplace');
  const [selectedFee, setSelectedFee] = useState('');
  const [selectedSort, setSelectedSort] = useState('');
  const [strategies , setstrategies] = useState([])
  const [mystartergieslist , setmystartergieslist] = useState([]);

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
    onDeploy,
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
          radius={"0.4rem"}
            styles={{
              root: {
                backgroundColor: "#000",
                color: "#fff",
              },
            }}
            onClick={onDeploy}
          >
            Deploy
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

    const fetmystartergies = async () =>{
      try {
        const strategies = await apiRequest("POST","/api/createstartergy/user/userid")
        console.log(strategies)
        setmystartergieslist(strategies);
      }
      catch(err){
        console.log(err)
      }
    }
  
  useEffect(()=>{
    fetchStratergy();
    fetmystartergies();
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
                  key={strategy.id}
                  shadow="sm"
                  padding="xl"
                  radius="md"
                  mb="lg"
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid #e9ecef',
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
                    <Badge
                      size="lg"
                      radius="md"
                      style={{
                        backgroundColor: '#d3f9d8',
                        color: '#2b8a3e',
                        fontWeight: 600,
                        textTransform: 'none',
                        padding: '8px 16px',
                        fontSize: '13px',
                      }}
                    >
                      Subscribed
                    </Badge>
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

                    <Button
                      size="md"
                      radius="md"
                      variant="outline"
                      style={{
                        borderColor: '#dc3545',
                        color: '#dc3545',
                        fontWeight: 600,
                        paddingLeft: '32px',
                        paddingRight: '32px',
                      }}
                    >
                      DEPLOY
                    </Button>
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
                          onView={() => console.log("view", signal.id)}
                          onDeploy={() => console.log("deploy", signal.id)}
                        />
                      </Grid.Col>
                    ))}
                  </Grid>
            )
          }

          

          {/* Footer */}
{/*           <Group justify="space-between" mt="xl" pt="xl" style={{ borderTop: '1px solid #e9ecef' }}>
            <Text size="sm" c="#495057">
              Contact Us
            </Text>
            <Text size="sm" c="#495057">
              Terms and Conditions
            </Text>
            <Text size="sm" c="#495057">
              Privacy policy
            </Text>
          </Group> */}
        </Container>
      </Box>
  )
}

export default Stratergies