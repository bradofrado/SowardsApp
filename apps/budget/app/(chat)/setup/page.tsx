import { cookies } from "next/headers";

import { Chat } from "@/components/chat";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { convertToUIMessages, generateUUID } from "@/lib/utils";
import { DataStreamHandler } from "@/components/data-stream-handler";
import { getMessagesByChatId } from "@/lib/db/queries";
import { getAuthSession } from "next-utils/src/utils/auth";
import { notFound } from "next/navigation";
import { Message } from "ai";
import { getExternalLogins, getTransactions } from "api/src/services/budget";
import { AccountProvider } from "@/utils/components/providers/account-provider";
import { TransactionProvider } from "@/utils/components/providers/transaction-provider";
import { aiWorkflowMap } from "@/lib/ai/tools/ai-workflow";
export default async function Page() {
  const id = "7bac2239-f9e7-43ed-9fe1-52106e998e40";

  // const messagesFromDb = await getMessagesByChatId({
  //   id,
  // });

  const initialMessages: Message[] = [
    {
      id: generateUUID(),
      content:
        "Hello and welcome to plinq! I'm going to help you setup your first budget. To start off, what is the name of your account?",
      role: "system",
    },
  ];

  const session = await getAuthSession();
  if (!session) {
    notFound();
  }

  const accounts = session.auth.userVacation
    ? await getExternalLogins(session.auth.userVacation.id)
    : [];
  const transactions = session.auth.userVacation
    ? await getTransactions(session.auth.userVacation.id, true)
    : [];

  if (session.auth.userVacation) {
    initialMessages.push(
      ...([
        {
          id: generateUUID(),
          content: session.auth.userVacation.name,
          role: "user",
        },
        {
          id: generateUUID(),
          content: aiWorkflowMap.getAccountName.content({
            accountName: session.auth.userVacation.name,
          }),
          toolInvocations: [
            {
              args: {
                accountName: session.auth.userVacation.name,
              },
              state: "result",
              toolCallId: generateUUID(),
              toolName: "getAccountName",
              result: undefined,
            },
          ],
          role: "assistant",
        },
        {
          id: generateUUID(),
          content: aiWorkflowMap.connectBankAccount.content({ accounts }),
          role: "assistant",
          toolInvocations: [
            {
              args: { accounts },
              state: accounts.length > 0 ? "result" : "call",
              result: undefined,
              toolCallId: generateUUID(),
              toolName: "connectBankAccount",
            },
          ],
        },
      ] satisfies Message[]),
    );

    if (accounts.length > 0) {
      initialMessages.push({
        id: generateUUID(),
        content: aiWorkflowMap.calculateFinanceTotals.content(undefined),
        role: "assistant",
        toolInvocations: [
          {
            args: {},
            state: "result",
            toolCallId: generateUUID(),
            toolName: "calculateFinanceTotals",
            result: undefined,
          },
        ],
      });
    }
  }

  return (
    <AccountProvider accounts={accounts} transactions={transactions}>
      <TransactionProvider
        transactions={transactions}
        budget={undefined}
        categories={[]}
      >
        <Chat
          key={id}
          id={id}
          initialMessages={initialMessages}
          selectedChatModel={DEFAULT_CHAT_MODEL}
          selectedVisibilityType="private"
          isReadonly={false}
        />
        <DataStreamHandler id={id} />
      </TransactionProvider>
    </AccountProvider>
  );
}
