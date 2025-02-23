import { ExternalAccount } from "@/utils/components/totals/types";
import { Tool, tool } from "ai";
import { groupBy, groupByDistinct } from "model/src/utils";
import { z } from "zod";

export interface AIWorkflow<NAME extends string = string, PARAMETERS = any> {
  toolName: NAME;
  streamText?: {
    tool: Tool<z.ZodType<PARAMETERS>>;
    prompt: string;
  };
  content: (args: PARAMETERS) => string;
  defaultArgs: PARAMETERS;
}

const workflow = <PARAMETERS, NAME extends string>(
  workflow: AIWorkflow<NAME, PARAMETERS>,
) => {
  return workflow;
};

export const aiWorkflows = [
  workflow({
    toolName: "getAccountName",
    streamText: {
      tool: tool({
        description: "Get the user's account name",
        parameters: z.object({
          accountName: z.string(),
        }),
      }),
      prompt:
        "You are a helpful assistant that will help the user create a budget. The process of creating a budget takes multiple steps, and the first step is getting the user's account name. If you cannot infer the user's account name, then keep asking politely until they give it to you.",
    },
    content({ accountName }) {
      return `Your account name is ${accountName}. Awesome!`;
    },
    defaultArgs: {
      accountName: "",
    },
  }),
  workflow<{ accounts: ExternalAccount[] }, "connectBankAccount">({
    toolName: "connectBankAccount",
    content() {
      return "Awesome. Now let us calculate information about your finances";
    },
    defaultArgs: {
      accounts: [],
    },
  }),
  workflow({
    toolName: "calculateFinanceTotals",
    content() {
      return "Awesome. Now let us calculate information about your finances";
    },
    defaultArgs: {},
  }),
] as const;
export const aiWorkflowMap = groupByDistinct(aiWorkflows, "toolName");

export type AIWorkflowName = (typeof aiWorkflows)[number]["toolName"];
export type AIWorkflowParameters<NAME extends AIWorkflowName> =
  (typeof aiWorkflowMap)[NAME] extends AIWorkflow<NAME, infer PARAMETERS>
    ? PARAMETERS
    : never;
