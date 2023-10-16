import type { DocumentViewerComponent } from "../types";

export const ImageViewer: DocumentViewerComponent = ({src}) => {
	return (
		<div className="h-screen p-10">
			<img alt="Opened" className="w-full h-full object-contain" src={src}/>
		</div>
	)
}