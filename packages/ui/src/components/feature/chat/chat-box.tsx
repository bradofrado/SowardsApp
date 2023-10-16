import { type User } from "model/src/user";
import { displayDate, displayRelativeDate, groupBy } from "model/src/utils";
import type { Message } from "model/src/message";
import { Pill } from "../../components/core/pill";
import { ChatMessage } from "./message";
import { SendMessage } from "./send-message";

export interface ChatBoxProps {
	chatId: string;
  user: User;
	className?: string;
	messages: Message[];
	onSendMessage: (id: string, message: string, user: User) => void;
	sendMessagePlaceholder?: string;
}
export const ChatBox: React.FunctionComponent<ChatBoxProps> = ({ chatId, user, className, messages, onSendMessage, sendMessagePlaceholder }) => {
	const groupedByTime = groupBy(messages.map(message => ({...message, day: displayDate(message.date)})), 'day');
	return (
		<div className={`${className} flex flex-col max-h-screen dark:bg-[#282a2d]`}>
			<div className="p-8 mb-15 flex-col gap-2 flex-1 justify-end overflow-auto">
				{Object.entries(groupedByTime).map(([date, _messages]) => (
					<MessageDateSegment date={date} key={date} messages={_messages} user={user}/>
				))}
			</div>
			<SendMessage chatId={chatId} onSendMessage={onSendMessage} placeholder={sendMessagePlaceholder} user={user}/>
		</div>
	)
}

interface MessageDateSegmentProps {
	messages: Message[],
	date: string,
	user: User
}
const MessageDateSegment: React.FunctionComponent<MessageDateSegmentProps> = ({messages, date, user}) => {
	const dateReal = new Date(date);
	return (
		<div className="flex flex-col gap-2">
			<div className="my-4">
				<Pill className="w-fit mx-auto" mode='secondary'>{displayRelativeDate(dateReal)}</Pill>
			</div>
			{messages.map(message => <ChatMessage
					isUser={message.userId === user.id}
					key={message.id}
					message={message}
				/>)}
		</div>
	)
}
