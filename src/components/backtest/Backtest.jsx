import React from "react";
import { Badge, Box, Card, Group, SimpleGrid, Text, ThemeIcon } from "@mantine/core";
import { IconArrowRight, IconChartCandle } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

// one card per strategy that has a backtest API
const strategies = [
  {
    title: "pivot_cumulative_option_buying",
    description:
      "NIFTY CE + PE option buying on previous-day pivot levels (P, R1–R3, S1–S3). " +
      "Cumulative ₹3,250 side target, lot ladder 2 → 15, strike change outside 170–280, −₹13,000 day stop.",
    tags: ["NIFTY", "Options", "1-min data"],
    path: "/backtest/pivot-cumulative-option-buying",
  },
  {
    title: "nifty_option_pivot_buffer",
    description:
      "NIFTY CE + PE option buying, all tick based. Pivot touch arms it, entry at pivot + 25% of the gap to the next pivot, " +
      "target entry + 30% of the gap, SL back at the pivot. 1 lot, same 09:17 selection and strike change.",
    tags: ["NIFTY", "Options", "1-min data"],
    path: "/backtest/nifty-option-pivot-buffer",
  },
];

const Backtest = () => {
  const navigate = useNavigate();

  return (
    <Box p="md">
      <Text size="xl" fw={700}>
        Backtest
      </Text>
      <Text size="sm" c="dimmed" mb="lg">
        Pick a strategy to run it on historical Dhan data
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {strategies.map((s) => (
          <Card
            key={s.path}
            withBorder
            radius="md"
            padding="lg"
            style={{ cursor: "pointer" }}
            onClick={() => navigate(s.path)}
          >
            <Group justify="space-between" mb="sm">
              <ThemeIcon size={42} radius="md" variant="light">
                <IconChartCandle size={24} />
              </ThemeIcon>
              <IconArrowRight size={20} color="gray" />
            </Group>

            <Text fw={600} mb={6} style={{ wordBreak: "break-word" }}>
              {s.title}
            </Text>
            <Text size="sm" c="dimmed" mb="md">
              {s.description}
            </Text>

            <Group gap={6}>
              {s.tags.map((t) => (
                <Badge key={t} variant="light" size="sm">
                  {t}
                </Badge>
              ))}
            </Group>
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default Backtest;
