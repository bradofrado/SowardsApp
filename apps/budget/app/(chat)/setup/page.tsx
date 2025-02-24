import { cookies } from "next/headers";

import { Chat } from "@/components/chat";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { convertToUIMessages, generateUUID } from "@/lib/utils";
import { getAuthSession } from "next-utils/src/utils/auth";
import { notFound } from "next/navigation";
import { Message } from "ai";
import { getExternalLogins, getTransactions } from "api/src/services/budget";
import { AccountProvider } from "@/utils/components/providers/account-provider";
import { TransactionProvider } from "@/utils/components/providers/transaction-provider";
import { getMessagesByChatId } from "api/src/repositories/chat/chat";

export default async function Page() {
  const id = "7bac2239-f9e7-43ed-9fe1-52106e998e40";

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

  const initialMessages: Message[] = convertToUIMessages(
    await getMessagesByChatId({
      chatId: id,
    }),
  );

  if (initialMessages.length === 0) {
    initialMessages.push({
      id: generateUUID(),
      content:
        "Hello and welcome to plinq! I'm going to help you setup your first budget. To start off, what is the name of your account?",
      role: "system",
    });
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
      </TransactionProvider>
    </AccountProvider>
  );
}
