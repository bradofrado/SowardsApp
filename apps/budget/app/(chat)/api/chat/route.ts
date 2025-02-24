import {
  type Message,
  type ToolInvocation,
  createDataStreamResponse,
  formatDataStreamPart,
  smoothStream,
  streamText,
} from "ai";

import { myProvider } from "@/lib/ai/models";
import { budgetSetupPrompt } from "@/lib/ai/prompts";
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
  saveToolResult,
} from "@/lib/db/queries";
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from "@/lib/utils";

import { getAuthSession } from "next-utils/src/utils/auth";
import * as ToolCalls from "@/lib/ai/tools/budget-workflow";
import { isToolCall } from "@/lib/ai/tools/budget-workflow.utils";
import { redirect } from "next/navigation";

const {
  connectBankAccount,
  createAccount,
  calculateFinanceTotals,
  createBudgetTool,
} = ToolCalls;

export const maxDuration = 60;

export async function POST(request: Request) {
  const {
    id,
    messages,
    selectedChatModel,
  }: { id: string; messages: Array<Message>; selectedChatModel: string } =
    await request.json();

  const session = await getAuthSession();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userMessage = getMostRecentUserMessage(messages);

  if (!userMessage) {
    return new Response("No user message found", { status: 400 });
  }

  const chat = await getChatById({ id });

  if (!chat && session.auth.userVacation?.id) {
    const title = "Setup";
    await saveChat({ id, userId: session.auth.userVacation.id, title });
  }
  const lastMessage = messages[messages.length - 1];

  // For tool calls, the last message won't be from the user, so we don't want to save this.
  if (userMessage.id === lastMessage.id) {
    await saveMessages({
      messages: [
        {
          ...userMessage,
          createdAt: new Date(),
          chatId: id,
        },
      ],
    });
  }

  return createDataStreamResponse({
    execute: async (dataStream) => {
      let hasRedirect = false;
      if (lastMessage.toolInvocations) {
        lastMessage.toolInvocations = await Promise.all(
          lastMessage.toolInvocations.map<Promise<ToolInvocation>>(
            async (toolInvocation) => {
              const { toolName, args, toolCallId, state } = toolInvocation;

              if (state !== "result") return toolInvocation;

              if (isToolCall(toolName)) {
                const resultParameters = toolInvocation.result;
                const executeResult =
                  ToolCalls[toolName].executeResult ?? (async () => ({}));
                try {
                  const result = await executeResult(
                    (
                      ToolCalls[toolName].resultParameters ??
                      ToolCalls[toolName].parameters
                    ).parse(resultParameters),
                  );

                  dataStream.write(
                    formatDataStreamPart("tool_result", {
                      toolCallId,
                      result,
                    }),
                  );

                  await saveToolResult({
                    toolCallId,
                    messageId: lastMessage.id,
                  });

                  if (result === false) {
                    hasRedirect = true;
                  }

                  return {
                    ...toolInvocation,
                    result,
                  };
                } catch (error) {
                  console.error(`Error executing ${toolName}:`, error);
                  // Optionally, you can return a failed status or a default value
                  return {
                    ...toolInvocation,
                    error: `Failed to execute ${toolName}`,
                  };
                }
              }

              return toolInvocation;
            },
          ),
        );
      }

      if (hasRedirect) {
        return redirect("/");
      }

      const result = streamText({
        model: myProvider.languageModel(selectedChatModel),
        system: budgetSetupPrompt,
        messages,
        maxSteps: 5,
        experimental_activeTools:
          selectedChatModel === "chat-model-reasoning"
            ? []
            : [
                "createAccount",
                "connectBankAccount",
                "calculateFinanceTotals",
                "createBudgetTool",
              ],
        experimental_transform: smoothStream({ chunking: "word" }),
        experimental_generateMessageId: generateUUID,
        tools: {
          createAccount,
          connectBankAccount,
          calculateFinanceTotals,
          createBudgetTool,
        },
        onFinish: async ({ response, reasoning, steps }) => {
          if (!session.auth.userVacation) {
            session.auth.userVacation = (await getAuthSession())?.auth
              .userVacation;
          }

          if (session.auth.userVacation?.id) {
            try {
              const sanitizedResponseMessages = sanitizeResponseMessages({
                messages: response.messages,
                reasoning,
              });
              if (sanitizedResponseMessages.length > 0) {
                await saveMessages({
                  messages: sanitizedResponseMessages.map((message) => {
                    return {
                      id: message.id,
                      chatId: id,
                      role: message.role,
                      content: message.content,
                      createdAt: new Date(),
                      experimental_attachments: undefined,
                    };
                  }),
                });
              }
            } catch (error) {
              console.error("Failed to save chat");
            }
          }
        },
        experimental_telemetry: {
          isEnabled: true,
          functionId: "stream-text",
        },
      });

      result.mergeIntoDataStream(dataStream, {
        sendReasoning: true,
      });
    },
    onError: (error: { message: string }) => {
      if (error.message === "NEXT_REDIRECT") {
        return "NEXT_REDIRECT";
      }
      console.error(error);
      return "Oops, an error occured!";
    },
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await getAuthSession();

  if (!session || !session.auth.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.auth.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });

    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
