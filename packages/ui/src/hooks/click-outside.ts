import { useEffect } from "react";
import { useModal } from "../components/core/modal";

export const useClickOutside = (ref: React.RefObject<HTMLElement>, callback: () => void): void => {
	const {container} = useModal();

	const onClick = (e: MouseEvent): void => {
		if (!ref.current?.contains(e.target as Node)) {
			callback();
		}
	}
	useEffect(() => {
		container?.addEventListener('mousedown', onClick);

		return () => {
			container?.removeEventListener('mousedown', onClick)
		}
	}, [])
}