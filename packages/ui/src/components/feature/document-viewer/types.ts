export type DocumentType = 'pdf' | 'img';

interface DocumentViewerComponentProps {
	src: string
}
export type DocumentViewerComponent = React.FunctionComponent<DocumentViewerComponentProps>

interface PagedDocumentViewerComponentProps extends DocumentViewerComponentProps {
	page: number,
	setPage: (page: number) => void
}
export type PagedDocumentViewerComponent = React.FunctionComponent<PagedDocumentViewerComponentProps>
