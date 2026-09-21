import { Book } from "@/types";
import React, { useEffect, useState, useRef, memo, useMemo, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface FlipbookModalProps {
  book: Book | null;
  onClose: () => void;
}

// Extract static components to prevent react-pdf from remounting due to inline JSX props
const PageLoadingFallback = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center w-full h-full bg-slate-50 text-slate-300">
    <i className="fa-solid fa-spinner fa-spin text-3xl mb-2"></i>
    <span className="text-sm font-medium animate-pulse">Memuat...</span>
  </div>
);

const DocumentLoadingFallback = () => (
  <div className="flex flex-col items-center justify-center text-white mt-32">
    <i className="fa-solid fa-spinner fa-spin text-4xl mb-4"></i>
    <p className="animate-pulse font-medium">Menyiapkan Buku...</p>
  </div>
);

const LazyPdfPage = memo(({ pageNumber }: { pageNumber: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number>(1 / 1.414); // Default A4 ratio
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Only mount when entering view. DO NOT UNMOUNT! 
          // Unmounting causes sub-pixel height differences which cause the scrollbar to jump (flickering).
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { rootMargin: '200% 0px' } 
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    if (pageNumber <= 3) setIsVisible(true);

    return () => observer.disconnect();
  }, [pageNumber]);

  // Memoize the onLoadSuccess to prevent Page remounts
  const handlePageLoadSuccess = useCallback((page: any) => {
    const width = page.originalWidth || page.view?.[2] || 800;
    const height = page.originalHeight || page.view?.[3] || 1131;
    if (width && height) {
      setAspectRatio(width / height);
    }
  }, []);

  // Memoize device pixel ratio to be completely stable
  const dpr = useMemo(() => typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full bg-white shadow-xl mb-6 md:mb-8 flex justify-center rounded-md overflow-hidden relative transition-all duration-300"
      style={{ aspectRatio: aspectRatio }}
    >
      {isVisible ? (
        <div className="absolute inset-0 w-full h-full flex justify-center items-center">
          <Page 
            pageNumber={pageNumber} 
            renderTextLayer={false}
            renderAnnotationLayer={false}
            width={800}
            devicePixelRatio={dpr}
            className="w-full h-full [&_canvas]:!w-full [&_canvas]:!h-full [&_canvas]:!object-contain"
            onLoadSuccess={handlePageLoadSuccess}
            loading={<PageLoadingFallback />}
          />
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center w-full h-full bg-slate-100/50 text-slate-300">
          <i className="fa-solid fa-file-pdf text-4xl mb-2 opacity-30"></i>
          <p className="opacity-50 font-medium">Halaman {pageNumber}</p>
        </div>
      )}
      
      <div className="absolute bottom-3 right-4 px-3 py-1 bg-black/10 backdrop-blur-md rounded-full text-xs font-bold text-black/40 pointer-events-none z-10 shadow-sm">
        {pageNumber}
      </div>
    </div>
  );
});
LazyPdfPage.displayName = 'LazyPdfPage';

export default function FlipbookModal({ book, onClose }: FlipbookModalProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pdfError, setPdfError] = useState(false);

  const pdfUrl = useMemo(() => book?.pdfUrl || "", [book?.pdfUrl]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Memoize Document callbacks!
  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPdfError(false);
  }, []);

  const onDocumentLoadError = useCallback((error: any) => {
    console.error("PDF Load Error:", error);
    setPdfError(true);
  }, []);

  if (!book) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/95 backdrop-blur-md flex flex-col transition-opacity duration-300">
      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-50 bg-gradient-to-b from-slate-900 via-slate-900/80 to-transparent">
        <h3 className="text-white text-lg md:text-xl font-bold truncate pr-12 drop-shadow-lg">
          {book.title}
        </h3>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white bg-white/10 hover:bg-red-500 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all flex-shrink-0 shadow-lg"
        >
          <i className="fa-solid fa-xmark text-xl md:text-2xl"></i>
        </button>
      </div>

      {/* Scrolling Container */}
      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden pt-20 pb-12 custom-scrollbar scroll-smooth">
        {pdfError ? (
          <div className="w-full max-w-lg mx-auto p-8 mt-12 bg-white dark:bg-slate-800 rounded-xl flex flex-col items-center justify-center text-center shadow-2xl">
            <i className="fa-solid fa-circle-exclamation text-5xl text-red-500 mb-4"></i>
            <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Gagal Memuat PDF</h4>
            <p className="text-slate-500 mb-6">File PDF rusak, diblokir oleh CORS, atau format tidak didukung.</p>
            <button onClick={onClose} className="px-6 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium">
              Tutup
            </button>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center px-4 md:px-8">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<DocumentLoadingFallback />}
              className="w-full max-w-[900px] flex flex-col items-center"
            >
              {numPages && Array.from(new Array(numPages), (el, index) => (
                <LazyPdfPage 
                  key={`page_${index + 1}`} 
                  pageNumber={index + 1} 
                />
              ))}
            </Document>

            {numPages && (
              <div className="text-white/40 text-sm mt-8 flex flex-col items-center gap-2 pb-8">
                <i className="fa-solid fa-check-circle text-2xl"></i>
                <p className="font-medium">Akhir dari buku ({numPages} halaman)</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* CSS for custom scrollbar to look like Wattpad */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.15);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}} />
    </div>
  );
}
