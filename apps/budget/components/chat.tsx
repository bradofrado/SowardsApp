"use client";

import type { Attachment, Message } from "ai";
import { useChat } from "ai/react";
import { useEffect, useState } from "react";
import useSWR, { useSWRConfig } from "swr";

import { ChatHeader } from "@/components/chat-header";
import type { Vote } from "@/lib/db/schema";
import { fetcher, generateUUID } from "@/lib/utils";

import { Artifact } from "./artifact";
import { MultimodalInput } from "./multimodal-input";
import { Messages } from "./messages";
import { VisibilityType } from "./visibility-selector";
import { useArtifactSelector } from "@/hooks/use-artifact";
import { toast } from "sonner";
import { aiWorkflows } from "@/lib/ai/tools/ai-workflow";

export function Chat({
  id,
  initialMessages,
  selectedChatModel,
  selectedVisibilityType,
  isReadonly,
}: {
  id: string;
  initialMessages: Array<Message>;
  selectedChatModel: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const { mutate } = useSWRConfig();
  const [isLoadingOverride, setIsLoadingOverride] = useState(false);

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
    reload,
    addToolResult,
  } = useChat({
    id,
    body: { id, selectedChatModel: selectedChatModel },
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    onFinish: (message, options: { finishReason }) => {
      if (message.toolInvocations && message.toolInvocations.length > 0) {
        const toolInvocation =
          message.toolInvocations[message.toolInvocations.length - 1];
        if (toolInvocation.state !== "result") {
          return;
        }

        const toolCallIndex = aiWorkflows.findIndex(
          (workflow) => workflow.toolName === toolInvocation.toolName,
        );

        if (toolCallIndex === -1) {
          throw new Error(`Tool call ${toolInvocation.toolName} not found`);
        }

        const toolCall = aiWorkflows[toolCallIndex + 1];

        if (!toolCall) return;

        setTimeout(() =>
          append({
            id: generateUUID(),
            content: toolCall.content(toolInvocation.args),
            role: "assistant",
            toolInvocations: [
              {
                args: toolCall.defaultArgs,
                state: "call",
                toolCallId: generateUUID(),
                toolName: toolCall.toolName,
              },
            ],
          }),
        );
      }
    },
    onError: (error) => {
      console.error(error);
      toast.error("An error occured, please try again!");
    },
  });

  console.log(messages);

  useEffect(() => {
    if (messages.length === 1 && messages[0].role === "system") {
      setIsLoadingOverride(true);
      setTimeout(() => {
        setIsLoadingOverride(false);
      }, 3000);
    }
  }, [messages, setIsLoadingOverride]);

  const { data: votes } = useSWR<Array<Vote>>(
    `/api/vote?chatId=${id}`,
    fetcher,
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader
          chatId={id}
          selectedModelId={selectedChatModel}
          selectedVisibilityType={selectedVisibilityType}
          isReadonly={isReadonly}
        />

        <Messages
          chatId={id}
          isLoading={isLoading || isLoadingOverride}
          votes={votes}
          messages={isLoadingOverride ? [] : messages}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          isArtifactVisible={isArtifactVisible}
          addToolResult={addToolResult}
        />

        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              append={append}
            />
          )}
        </form>
      </div>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        append={append}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
        votes={votes}
        isReadonly={isReadonly}
      />
    </>
  );
}
