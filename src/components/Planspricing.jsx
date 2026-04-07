import React from "react";
import {
  Box,
  Container,
  Grid,
  Card,
  Text,
  Group,
  Badge,
  Button,
  List,
  ThemeIcon,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

const Planandpricing = () => {
  const plans = [
    {
      name: "Starter",
      tokens: 7,
      price: 499,
      features: [
        "7 Strategy Actions",
        "Create / Deploy / Backtest",
        "Basic Support",
      ],
      buttonText: "BUY NOW",
      isDark: false,
    },
    {
      name: "Trader Pack",
      tokens: 30,
      price: 1999,
      features: [
        "30 Strategy Actions",
        "Create / Deploy / Backtest",
        "Priority Support",
      ],
      buttonText: "BUY NOW",
      isDark: false,
    },
    {
      name: "Pro",
      tokens: 50,
      price: 3499,
      features: [
        "50 Strategy Actions",
        "All Features Access",
        "Priority Support",
        "Faster Execution",
      ],
      buttonText: "BUY NOW",
      isDark: true, // highlighted
    },
    {
      name: "Advanced",
      tokens: 100,
      price: 6899,
      features: [
        "100 Strategy Actions",
        "All Features Access",
        "Priority Support",
      ],
      buttonText: "BUY NOW",
      isDark: false,
    },
    {
      name: "Enterprise",
      tokens: 500,
      price: 32999,
      features: [
        "500 Strategy Actions",
        "All Features Access",
        "Dedicated Support",
      ],
      buttonText: "BUY NOW",
      isDark: false,
    },
  ];

  return (
    <Box style={{ backgroundColor: "#ffffff", minHeight: "100vh", padding: "40px 0" }}>
      {/* Heading */}
      <Text size="1.8rem" fw={700} ta="center" mb="xs">
        Plans and Pricing
      </Text>

      <Text size="sm" ta="center" c="#868e96" mb="xl">
        1 Token = 1 Strategy Action (Create / Deploy / Backtest / Signal)
      </Text>

      <Container size="xl" style={{ maxWidth: "1400px" }}>
        <Grid justify="center" gutter="lg">
          {plans.map((plan, index) => (
            <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4 }}>
              <Card
                radius="md"
                style={{
                  position: "relative",
                  backgroundColor: plan.isDark ? "#1e2952" : "white",
                  border: plan.isDark ? "none" : "1px solid #e9ecef",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* BEST VALUE Badge */}
                {plan.isDark && (
                  <Badge
                    color="blue"
                    variant="filled"
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                    }}
                  >
                    BEST VALUE
                  </Badge>
                )}

                {/* Plan Name */}
                <Text
                  size="xl"
                  fw={600}
                  ta="center"
                  mb="lg"
                  c={plan.isDark ? "white" : "#212529"}
                >
                  {plan.name}
                </Text>

                {/* Tokens */}
                <Group justify="center" mb="xs">
                  <Text size="xl" fw={700} c={plan.isDark ? "white" : "#212529"}>
                    {plan.tokens} Tokens
                  </Text>
                </Group>

                {/* Price */}
                <Text
                  size="lg"
                  fw={700}
                  ta="center"
                  c={plan.isDark ? "white" : "#212529"}
                >
                  ₹{plan.price}
                </Text>

                {/* Price per token */}
                <Text
                  size="xs"
                  ta="center"
                  c={plan.isDark ? "#b8c4d9" : "#868e96"}
                  mb="lg"
                >
                  ₹{(plan.price / plan.tokens).toFixed(1)} / token
                </Text>

                {/* Features */}
                <Box style={{ flex: 1 }} mb="xl">
                  <List
                    spacing="sm"
                    size="sm"
                    icon={
                      <ThemeIcon color="blue" size={20} radius="xl">
                        <IconCheck size={12} />
                      </ThemeIcon>
                    }
                  >
                    {plan.features.map((feature, idx) => (
                      <List.Item key={idx}>
                        <Text
                          size="sm"
                          c={plan.isDark ? "white" : "#495057"}
                          fw={500}
                        >
                          {feature}
                        </Text>
                      </List.Item>
                    ))}
                  </List>
                </Box>

                {/* Button */}
                <Button
                  fullWidth
                  size="md"
                  radius="md"
                  style={{
                    backgroundColor: plan.isDark ? "#3d5a9e" : "#e9ecef",
                    color: plan.isDark ? "white" : "#6c757d",
                    fontWeight: 600,
                    border: "none",
                  }}
                >
                  {plan.buttonText}
                </Button>
              </Card>
            </Grid.Col>
          ))}
        </Grid>

        {/* Footer */}
        <Text size="sm" c="#495057" mt="xl" ta="center">
          <Text component="span" fw={600}>
            Note:
          </Text>{" "}
          Tokens are deducted per strategy action. GST & payment gateway charges may apply.
        </Text>
      </Container>
    </Box>
  );
};

export default Planandpricing;