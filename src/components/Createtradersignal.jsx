import { ActionIcon, Box, Button, Card, Grid, Group, Modal, Stack, Text, Title } from '@mantine/core'
import React, { useEffect, useState } from 'react'
import { IconTrash } from '@tabler/icons-react';
import { apiRequest } from './utils/api';

const SingleTraderSignal = ({
  creatorName,
  timestamp,
  instrument,
  description,
  onView,
  onDeploy,
  onDelete,
  showDelete,
  showApprove   // ✅ new
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
        position: "relative"
      }}
    >
      {/* 🔥 Show only if My Signals */}
      {showDelete && (
        <ActionIcon
          color="red"
          variant="subtle"
          style={{
            position: "absolute",
            top: 10,
            right: 10
          }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <IconTrash size={18} />
        </ActionIcon>
      )}

      {/* Content */}
      <Stack gap={6}>
        <Text fw={600} size="md">
          {creatorName}
        </Text>

        <Text size="xs" c="dimmed">
          {timestamp}
        </Text>

        <Text fw={500} size="sm">
          Instrument: {instrument}
        </Text>

        <Text size="sm" c="dimmed">
          {description}
        </Text>
      </Stack>

      {/* Buttons */}
      <Group mt="lg" grow px={"1rem"}>
        <Button

          radius={"0.4rem"}
          styles={{
            root: {
              border:'1px solid black',
              backgroundColor: "#ffffff",
              color: "#000000",
            },
          }}
          onClick={onView}
        >
          View
        </Button>
         {showApprove && (
    <Button
      onClick={onDeploy}
      styles={{
        root: {
          backgroundColor: "#000",
          color: "#fff",
        },
      }}
    >
      Approve
    </Button>
  )}
      </Group>
    </Card>
  );
};
const Createtradersignal = () => {
  const [signals, setSignals] = useState([]);
      const [activeTab, setActiveTab] = useState('unapproved signals');
      const [opened, setOpened] = useState(false);
const [selectedSignal, setSelectedSignal] = useState(null);

const approveSignal = async (id) => {
  const confirmApprove = window.confirm("Are you sure you want to approve this signal?");

  if (!confirmApprove) return;

  try {
    await apiRequest('PATCH', `/api/trader-signal/signals/approve/${id}`);

    // remove from unapproved list instantly
    setSignals(prev => prev.filter(s => s.id !== id));

  } catch (err) {
    console.log(err);
  }
};

const handleView = (signal) => {
  setSelectedSignal(signal);
  setOpened(true);
};
  
       const Fetchsignals = async ()=>{
        setActiveTab('unapproved signals')
      const response = await apiRequest('GET','/api/trader-signal/status/false')
      await setSignals(response.data)
      /* console.log(response.data) */
    }

  useEffect(()=>{
    Fetchsignals()
  },[])

const deletesignal = async(id) =>{
  const confirmDelete = window.confirm("Are you sure you want to delete this signal?");

  if (!confirmDelete) return;

  try  { 
    await apiRequest('DELETE', `/api/trader-signal/signals/${id}`)
    setSignals(prev => prev.filter(s => s.id !== id))
  } catch(err){
    console.log(err)
  }
}

    const Fetchusersignals = async ()=>{

      setActiveTab('approved signals')
      
      const response = await apiRequest('GET','/api/trader-signal/status/true')

      await setSignals(response.data)
      /* console.log(response.data) */
    }
  return (
    <>
    <Title py={"1.5rem"} order={4} >Trader Signals</Title>
              <Group gap="md" mb="xl">
                <Button
                  size="md"
                  radius="xl"
                  style={{
                    backgroundColor: activeTab === 'unapproved signals' ? '#000000ff' : 'transparent',
                    color: activeTab === 'unapproved signals' ? 'white' : '#495057',
                    border: 'none',
                    fontWeight: 500,
                    paddingLeft: '28px',
                    paddingRight: '28px',
                  }}
                  onClick={() => Fetchsignals()}
                >
                  Un approved Signals
                </Button>
                <Button
                  size="md"
                  radius="xl"
                  variant="subtle"
                  style={{
                    backgroundColor: activeTab === 'approved signals' ? '#000000ff' : 'transparent',
                    color: activeTab === 'approved signals' ? 'white' : '#495057',
                    border: 'none',
                    fontWeight: 500,
                    paddingLeft: '28px',
                    paddingRight: '28px',
                  }}
                  onClick={() => Fetchusersignals()}
                >
                  Approved signals
                </Button>
              </Group>
    <Grid>
      {signals.map((signal) => (
        <Grid.Col
          key={signal.id}
          span={{ base: 12, sm: 6, md: 4, lg: 4 }}
        >
          <SingleTraderSignal
            creatorName={signal.creator_name}
            timestamp={signal.created_at}
            instrument={signal.index_name}
            description={signal.description}
            onView={() => handleView(signal)}
            onDeploy={() => approveSignal(signal.id)}
            onDelete={() => deletesignal(signal.id)}
            showDelete={activeTab === 'approved signals'}
            showApprove={activeTab === 'unapproved signals'}   // ✅ NEW
          />
        </Grid.Col>
      ))}
    </Grid>
    <Modal
  opened={opened}
  onClose={() => setOpened(false)}
  title="Signal Details"
  size="lg"
>
  {selectedSignal && (
    <Stack>

      <Text fw={600}>Creator:</Text>
      <Text>{selectedSignal.creator_name}</Text>

      <Text fw={600}>Instrument:</Text>
      <Text>{selectedSignal.index_name}</Text>

      <Text fw={600}>Created At:</Text>
      <Text>{selectedSignal.created_at}</Text>

      <Text fw={600}>Description:</Text>
      <Text>{selectedSignal.description || "N/A"}</Text>

      {/* LEGS */}
      <Text fw={700} mt="md">Legs</Text>

      {selectedSignal.config_json?.legs?.map((leg, index) => (
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
    </>
  )
}

export default Createtradersignal
