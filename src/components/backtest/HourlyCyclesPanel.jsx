import React from "react";
import { Badge, Paper, Table, Text } from "@mantine/core";
import { inr, pnlColor } from "./backtestUtils";

const stopColor = { "MAX LOSS": "red", "MAX PROFIT": "teal" };

/** One row per hourly cycle: its NIFTY range, trading window, entries, P&L and what stopped it.
 *  params = the run's params (cycle limits / max entries), so the panel fits every version. */
export const HourlyCyclesPanel = ({ cycles, params }) => {
  if (!cycles?.length) return null;
  const maxEntries = typeof params?.maxEntriesPerCycle === "number" ? params.maxEntriesPerCycle : null;
  const rules = [];
  if (params?.cycleMaxLoss != null) rules.push(`at ${inr(params.cycleMaxLoss)}`);
  if (params?.cycleMaxProfit != null) rules.push(`at +${inr(params.cycleMaxProfit)}`);
  if (maxEntries) rules.push(`after ${maxEntries} entries`);
  const note = rules.length
    ? `Each cycle stops ${rules.length > 1 ? `${rules.slice(0, -1).join(", ")} or ${rules[rules.length - 1]}` : rules[0]} (cycle limits use closed trades + the open trade, checked live).`
    : "No cycle limits and no entry limit in this run.";
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
                <Table.Td ta="right">{maxEntries ? `${c.entries} / ${maxEntries}` : c.entries}</Table.Td>
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
        {note}
      </Text>
    </Paper>
  );
};
