import type { Prisma } from "db/lib/generated/client";
import { prisma } from "db/lib/prisma";

export const saveChat = async ({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) => {
  const savedChat = await prisma.chat.create({
    data: { id, userId, title, visibility: "private" },
  });
  return savedChat;
};

export const getChatById = async ({ id }: { id: string }) => {
  const chat = await prisma.chat.findUnique({
    where: { id },
  });
  return chat;
};

export const getMessagesByChatId = async ({ chatId }: { chatId: string }) => {
  const messages = await prisma.message.findMany({
    where: {
      chatId,
    },
  });

  return messages;
};

export const saveMessages = async ({
  messages,
}: {
  messages: Prisma.MessageCreateManyInput[];
}) => {
  const savedMessages = await prisma.message.createMany({
    data: messages,
  });
  return savedMessages;
};

export const saveToolResult = async ({
  toolCallId,
  messageId,
}: {
  toolCallId: string;
  messageId: string;
}) => {
  const existingToolResult = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (existingToolResult) {
    const content = existingToolResult.content as {
      type: "tool-call" | "tool-result";
      toolCallId: string;
      toolName: string;
      args: unknown;
    }[];
    const toolCall = content.find((c) => c.toolCallId === toolCallId);
    if (toolCall) {
      toolCall.type = "tool-result";
    }
    return prisma.message.update({
      where: { id: messageId },
      data: { content: content as Prisma.JsonArray },
    });
  }
  throw new Error("Tool call not found");
};
