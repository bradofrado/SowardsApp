import { Document, Page, pdfjs } from 'react-pdf';
import type { DocumentViewerComponent } from '../types';
import { PagedDocumentViewer } from '../paged-viewer';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export const PDFViewer: DocumentViewerComponent = ({src}) => {
  return (
    <PagedDocumentViewer>
			{(page, setNumPages) => (
				<div className="w-fit p-2">
					<Document file={src} onLoadSuccess={({numPages}) => {setNumPages(numPages)}}>
						<Page pageNumber={page} />
					</Document>
				</div>
			)
			}
		</PagedDocumentViewer>
  ); 
}