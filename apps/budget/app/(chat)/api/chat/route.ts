import {
  type Message,
  createDataStreamResponse,
  formatDataStreamPart,
  smoothStream,
  streamText,
  tool,
} from "ai";

import { myProvider } from "@/lib/ai/models";
import { deleteChatById, getChatById } from "@/lib/db/queries";
import {
  generateUUID,
  getMostRecentAssistantMessage,
  getMostRecentUserMessage,
} from "@/lib/utils";

import { getAuthSession } from "next-utils/src/utils/auth";
import { z } from "zod";
import {
  AIWorkflow,
  aiWorkflowMap,
  aiWorkflows,
} from "@/lib/ai/tools/ai-workflow";

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
  const assistantMessage = getMostRecentAssistantMessage(messages);

  // if (!userMessage) {
  //   return new Response("No user message found", { status: 400 });
  // }

  // const chat = await getChatById({ id });

  // if (!chat) {
  //   //const title = await generateTitleFromUserMessage({ message: userMessage });
  //   await saveChat({
  //     id,
  //     userId: session.auth.userId,
  //     title: "Setup your budget",
  //   });
  // }

  // await saveMessages({
  //   messages:
  //     messages.length === 2
  //       ? messages.map((message) => ({
  //           ...message,
  //           createdAt: new Date(),
  //           chatId: id,
  //         }))
  //       : [{ ...userMessage, createdAt: new Date(), chatId: id }],
  // });

  return createDataStreamResponse({
    execute: async (dataStream) => {
      if (
        assistantMessage?.toolInvocations &&
        assistantMessage.toolInvocations.length > 0
      ) {
        const toolInvocation =
          assistantMessage.toolInvocations[
            assistantMessage.toolInvocations.length - 1
          ];
        if (toolInvocation.state !== "result") return;

        const toolCall = aiWorkflowMap[toolInvocation.toolName] as
          | AIWorkflow
          | undefined;

        if (!toolCall) {
          throw new Error(`Tool call ${toolInvocation.toolName} not found`);
        }

        dataStream.write(
          formatDataStreamPart("tool_result", {
            toolCallId: toolInvocation.toolCallId,
            result: {},
          }),
        );
        toolInvocation.state = "result";
        toolInvocation.result = {};

        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system: `You are a helpful assistant that will help the user through a list of tasks workflow. Give a friendly response to the last task the user has completed. Don't do anything else like ask another question.`,
          messages,
        });

        result.mergeIntoDataStream(dataStream);
      } else {
        const initialToolCall = aiWorkflows[0];
        if (!initialToolCall.streamText) {
          throw new Error("Initial tool call not found");
        }

        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system: initialToolCall.streamText.prompt,
          messages,
          maxSteps: 1,
          experimental_activeTools:
            selectedChatModel === "chat-model-reasoning"
              ? []
              : [initialToolCall.toolName],
          experimental_transform: smoothStream({ chunking: "word" }),
          experimental_generateMessageId: generateUUID,
          tools: {
            [initialToolCall.toolName]: initialToolCall.streamText.tool,
          },
          experimental_telemetry: {
            isEnabled: true,
            functionId: "stream-text",
          },
        });

        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
      }
    },
    onError: () => {
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

  if (!session || !session.auth.userVacation) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.auth.userVacation.id) {
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
