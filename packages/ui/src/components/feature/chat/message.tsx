import type { Message } from "model/src/message";
import { displayTime } from "model/src/utils";
import { ProfileImage } from "../profile/profile-image";

export interface ChatMessageProps {
  message: Message;
  isUser: boolean;
}
export const ChatMessage: React.FunctionComponent<ChatMessageProps> = ({ message, isUser }) => {
  return (
		<div className={`flex gap-2 ${isUser ? "ml-auto" : ""}`}>
			{!isUser && (
				<ProfileImage className="w-9 h-9 mt-1" image={message.avatar} />
			)}
			<div className="flex flex-col gap-2 flex-1">
				<div
					className={`rounded-md  ${
						isUser
							? "rounded-br-sm bg-primary"
							: "dark:bg-[#343434] border border-[#ecebeb] rounded-bl-sm"
					}`}
				>
					<div className={`${isUser ? "text-white" : ""} py-2 px-4`}>
						<p className="">{message.text}</p>
					</div>
				</div>
				<div className={`text-[#72767e] text-sm ${isUser ? "self-end" : ""}`}>
					<span>{message.name} {displayTime(message.date)}</span>
				</div>
			</div>
		</div>
  );
};
