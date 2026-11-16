import React from "react";
import { Badge, Paper, Table, Text } from "@mantine/core";
import { inr, pnlColor } from "./backtestUtils";

const stopColor = { "MAX LOSS": "red", "MAX PROFIT": "teal", "2 ENTRIES USED": "gray" };

/** One row per hourly cycle: its NIFTY range, trading window, entries, P&L and what stopped it. */
export const HourlyCyclesPanel = ({ cycles }) => {
  if (!cycles?.length) return null;
  return (
    <Paper withBorder radius="md" p="md">
      <Text fw={600} mb="sm">
        Hourly cycles
      </Text>
      <Table.ScrollContainer minWidth={720}>
        <Table verticalSpacing="xs" fz="sm" striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Cycle</Table.Th>
              <Table.Th>NIFTY range</Table.Th>
              <Table.Th ta="right">High</Table.Th>
              <Table.Th ta="right">Low</Table.Th>
              <Table.Th>Trades in</Table.Th>
              <Table.Th ta="right">Entries</Table.Th>
              <Table.Th ta="right">Cycle P&L</Table.Th>
              <Table.Th>Stopped by</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {cycles.map((c) => (
              <Table.Tr key={c.cycle}>
                <Table.Td fw={700}>C{c.cycle}</Table.Td>
                <Table.Td>{c.range.join(" – ")}</Table.Td>
                <Table.Td ta="right" c="teal">
                  {c.high ?? "-"}
                </Table.Td>
                <Table.Td ta="right" c="red">
                  {c.low ?? "-"}
                </Table.Td>
                <Table.Td>{c.window.join(" – ")}</Table.Td>
                <Table.Td ta="right">{c.entries} / 2</Table.Td>
                <Table.Td ta="right" fw={600} c={pnlColor(c.pnl)}>
                  {c.entries ? inr(c.pnl) : "-"}
                </Table.Td>
                <Table.Td>
                  {c.stoppedBy ? (
                    <Badge size="sm" variant="light" color={stopColor[c.stoppedBy] || "gray"}>
                      {c.stoppedBy}
                    </Badge>
                  ) : (
                    "-"
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      <Text size="xs" c="dimmed" mt={6}>
        Each cycle stops at −₹3,500 or +₹5,000 (closed trades + open trade, checked live) or after 2 entries.
      </Text>
    </Paper>
  );
};
