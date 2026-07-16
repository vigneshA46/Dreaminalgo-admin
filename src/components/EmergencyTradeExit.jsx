import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Grid,
  Group,
  Modal,
  Stack,
  Text,
  Title,
  ThemeIcon,
  Table,
  Badge,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconCurrencyRupee,
  IconLogout2,
} from "@tabler/icons-react";
import { apiRequest } from "./utils/api";


export default function EmergencyTradeExit() {
  const [strategies, setStrategies] = useState([]);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [opened, setOpened] = useState(false);
  const [deployments, setDeployments] = useState([]);

  useEffect(() => {
    fetchStrategies();
  }, []);

  const stopDeployment = async (deploymentId) => {
  return await apiRequest(
    "POST",
    `/api/deployments/userdep/stopdep/${deploymentId}`
  );
};
const exitStrategy = (deploymentId) => {
  modals.openConfirmModal({
    title: "Exit Strategy",
    centered: true,
    children: (
      <Text size="sm">
        Are you sure you want to exit this strategy?
      </Text>
    ),
    labels: {
      confirm: "Exit",
      cancel: "Cancel",
    },
    confirmProps: {
      color: "red",
    },
    onConfirm: async () => {
      try {
        await stopDeployment(deploymentId);

        notifications.show({
          title: "Success",
          message: "Strategy exited successfully",
          color: "green",
        });

        fetchTodayDeployments(selectedStrategy.id);
      } catch (err) {
        notifications.show({
          title: "Failed",
          message: "Unable to exit strategy",
          color: "red",
        });
      }
    },
  });
};


const exitAllStrategies = () => {
  modals.openConfirmModal({
    title: "Exit All Users",
    centered: true,
    children: (
      <Text size="sm">
        This will exit all active deployments for this strategy. Continue?
      </Text>
    ),
    labels: {
      confirm: "Exit All",
      cancel: "Cancel",
    },
    confirmProps: {
      color: "red",
    },
    onConfirm: async () => {
      try {
        // Exit every deployment
        await Promise.allSettled(
            deployments.map((deployment) =>
            stopDeployment(deployment.id)
  )
);

        notifications.show({
          title: "Success",
          message: "All deployments exited successfully.",
          color: "green",
        });

        fetchTodayDeployments(selectedStrategy.id);
      } catch (err) {
        console.error(err);

        notifications.show({
          title: "Failed",
          message: "Some deployments could not be exited.",
          color: "red",
        });
      }
    },
  });
};
const fetchTodayDeployments = async (strategyId) => {
  try {
    const deployments = await apiRequest(
      "GET",
      `/api/deployments/today/${strategyId}`
    );

    const deploymentsWithUsers = await Promise.all(
      deployments.map(async (deployment) => {
        try {
          const user = await apiRequest(
            "GET",
            `/api/users/${deployment.user_id}`
          );

          return {
            ...deployment,
            user,
          };
        } catch (err) {
          console.error(err);

          return {
            ...deployment,
            user: null,
          };
        }
      })
    );

    setDeployments(deploymentsWithUsers);
  } catch (err) {
    console.error(err);
  }
};

  const fetchStrategies = async () => {
    try {
      const response = await apiRequest("GET", "/api/stratergy");
      setStrategies(response.strategies || []);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Box p="md">
        <Group mb="xl">
          <ThemeIcon color="red" size={45} radius="md">
            <IconAlertTriangle size={24} />
          </ThemeIcon>

          <Box>
            <Title order={2}>Emergency Trade Exit</Title>
            <Text c="dimmed">
              Exit trades for individual users or all users running a strategy.
            </Text>
          </Box>
        </Group>

        <Grid>
          {strategies.map((strategy) => (
            <Grid.Col key={strategy.id} span={{ base: 12, md: 6, lg: 4 }}>
              <Card
                shadow="sm"
                radius="md"
                withBorder
                style={{
                  cursor: "pointer",
                  transition: "0.2s",
                }}
                    onClick={() => {
                        setSelectedStrategy(strategy);
                        setOpened(true);
                        fetchTodayDeployments(strategy.id);
                    }}  
              >
                <Stack gap="md">
                  <Box>
                    <Text fw={700} size="lg">
                      {strategy.name}
                    </Text>

                    <Text size="sm" c="dimmed" mt={5}>
                      {strategy.description}
                    </Text>
                  </Box>

                  <Group justify="space-between">
                    <Group gap={4}>
                      <IconCurrencyRupee
                        size={18}
                        color="#fa5252"
                      />
                      <Text fw={700}>
                        {strategy.capital_required}
                      </Text>
                    </Group>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Box>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        centered
        size="xl"
        title={
          <Text fw={700} size="lg">
            {selectedStrategy?.name}
          </Text>
        }
      >
        <Stack>

          <Card
            withBorder
            bg="red.0"
          >
            <Group justify="space-between">
              <Box>
                <Text fw={600} c="red">
                  Emergency Controls
                </Text>

                <Text size="sm" c="dimmed">
                  This action immediately exits running trades.
                </Text>
              </Box>

              <Button
                color="red"
                leftSection={<IconLogout2 size={18} />}
                onClick={exitAllStrategies}
              >
                Exit All Users
              </Button>
            </Group>
          </Card>

          <Card withBorder p="0">
  <Table striped highlightOnHover withTableBorder>
    <Table.Thead>
      <Table.Tr>
        <Table.Th>User ID</Table.Th>
        <Table.Th>Broker</Table.Th>
        <Table.Th>Type</Table.Th>
        <Table.Th ta="center">Multiplier</Table.Th>
        <Table.Th ta="center">Auto</Table.Th>
        <Table.Th ta="center">Status</Table.Th>
        <Table.Th>Deployed At</Table.Th>
        <Table.Th ta="center">Action</Table.Th>
      </Table.Tr>
    </Table.Thead>

    <Table.Tbody>

      {deployments.length === 0 ? (

        <Table.Tr>
          <Table.Td colSpan={8}>
            <Text ta="center" py="lg" c="dimmed">
              No deployments found for today.
            </Text>
          </Table.Td>
        </Table.Tr>

      ) : (

        deployments.map((deployment) => (

          <Table.Tr key={deployment.id}>

            <Table.Td>
    <Stack gap={0}>
        <Text fw={600}>
            {deployment.user?.fullname || "-"}
        </Text>

        <Text size="xs" c="dimmed">
            {deployment.user?.email || "-"}
        </Text>

        <Text size="xs" c="dimmed">
            {deployment.user?.mobile_number || "-"}
        </Text>
    </Stack>
</Table.Td>

            <Table.Td>
              <Badge variant="light">
                {deployment.broker_name}
              </Badge>
            </Table.Td>

            <Table.Td>
              {deployment.type}
            </Table.Td>

            <Table.Td ta="center">
              {deployment.multiplier}
            </Table.Td>

            <Table.Td ta="center">
              <Badge
                color={deployment.auto_deploy ? "green" : "gray"}
              >
                {deployment.auto_deploy ? "Yes" : "No"}
              </Badge>
            </Table.Td>

            <Table.Td ta="center">
              <Badge
                color={
                  deployment.status === "ACTIVE"
                    ? "green"
                    : "red"
                }
              >
                {deployment.status}
              </Badge>
            </Table.Td>

            <Table.Td>
              {new Date(deployment.deployed_at).toLocaleString()}
            </Table.Td>

            <Table.Td ta="center">
              <Button
                color="red"
                size="xs"
                onClick={() => exitStrategy(deployment.id)}
              >
                Exit
              </Button>
            </Table.Td>

          </Table.Tr>

        ))

      )}

    </Table.Tbody>
  </Table>
</Card>

        </Stack>
      </Modal>
    </>
  );
}