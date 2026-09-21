"use client";

import React, { useEffect, useState, useRef } from "react";
import { PDFViewer } from "@embedpdf/react-pdf-viewer";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export interface PdfViewerProps {
  pdfUrl: string;
  bookId: string;
  initialPage?: number;
}

export default function PdfViewer({ pdfUrl, bookId, initialPage }: PdfViewerProps) {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(initialPage || 1);
  const [isReady, setIsReady] = useState(false);
  
  const scrollCapRef = useRef<any>(null);
  const initialPageRef = useRef<number | null>(initialPage || null);

  // Load initial progress
  useEffect(() => {
    if (!user || !bookId) return;
    
    // If initialPage was passed via props (e.g. from Continue Reading), use it immediately
    if (initialPage && initialPage > 1) {
       initialPageRef.current = initialPage;
       setCurrentPage(initialPage);
       if (scrollCapRef.current && scrollCapRef.current.scrollToPage) {
          scrollCapRef.current.scrollToPage({ pageNumber: initialPage, behavior: 'instant' });
       }
       // Still fetch just in case it's out of sync, but we don't necessarily need to if we trust the URL
       return;
    }
    
    const fetchProgress = async () => {
      try {
        const docRef = doc(db, "users", user.uid, "readingProgress", bookId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().lastPage) {
           const p = docSnap.data().lastPage;
           initialPageRef.current = p;
           setCurrentPage(p);
           
           if (scrollCapRef.current && scrollCapRef.current.scrollToPage) {
              scrollCapRef.current.scrollToPage({ pageNumber: p, behavior: 'instant' });
           }
        }
      } catch (err) {
        console.error("Error fetching progress:", err);
      }
    };
    fetchProgress();
  }, [user, bookId, initialPage]);

  // Sync to Firebase on page change (debounced)
  useEffect(() => {
    if (!user || !bookId) return;

    const timeout = setTimeout(() => {
      setDoc(
        doc(db, "users", user.uid, "readingProgress", bookId),
        { lastPage: currentPage, updatedAt: new Date() },
        { merge: true }
      );
    }, 2000);

    return () => clearTimeout(timeout);
  }, [currentPage, user, bookId]);

  return (
    <div className="w-full flex justify-center items-start embedpdf-clean-viewer bg-[#f0f0f0] h-[calc(100vh-64px)] relative">
      <style>{`
        /* Sembunyikan elemen UI default embedpdf agar bersih polos */
        .embedpdf-clean-viewer [class*="Toolbar"],
        .embedpdf-clean-viewer [class*="toolbar"],
        .embedpdf-clean-viewer [class*="Sidebar"],
        .embedpdf-clean-viewer [class*="sidebar"],
        .embedpdf-clean-viewer .ep-toolbar,
        .embedpdf-clean-viewer .ep-sidebar {
          display: none !important;
        }
        
        /* Optional: hilangkan border dan shadow jika ada */
        .embedpdf-clean-viewer [class*="Document"] {
          box-shadow: none !important;
          border: none !important;
        }
      `}</style>

      {/* Loading state indicator before PDF is ready */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#f0f0f0]">
          <div className="text-gray-500 animate-pulse">Memuat buku...</div>
        </div>
      )}

      <PDFViewer
        config={{
          src: pdfUrl,
          tabBar: 'never',
          theme: { preference: 'light' },
          disabledCategories: ['annotation', 'zoom', 'document-print', 'search', 'form'],
          // Provide an empty schema to prevent toolbars from rendering
          ui: {
            schema: {
              id: 'empty-schema',
              version: '1.0',
              toolbars: {},
              sidebars: {},
              menus: {},
              modals: {},
              selectionMenus: {}
            }
          }
        }}
        style={{ width: '100%', height: '100%', border: 'none' }}
        onReady={async (registry) => {
          try {
            await registry.pluginsReady();
            
            // Hide loading indicator
            setIsReady(true);
            
            // Foolproof method: Inject CSS directly into the Shadow DOM to hide any remaining UI elements
            setTimeout(() => {
              try {
                const container = document.querySelector('.embedpdf-clean-viewer');
                if (container) {
                  // Find elements with shadow roots
                  const allElements = container.querySelectorAll('*');
                  for (let i = 0; i < allElements.length; i++) {
                    const shadow = allElements[i].shadowRoot;
                    if (shadow) {
                      const style = document.createElement('style');
                      style.textContent = `
                        [class*="toolbar"],
                        [class*="Toolbar"],
                        [class*="sidebar"],
                        [class*="Sidebar"],
                        .ep-toolbar,
                        .ep-sidebar,
                        [role="toolbar"] {
                          display: none !important;
                        }
                      `;
                      shadow.appendChild(style);
                    }
                  }
                }
              } catch (e) {
                console.error("Failed to inject shadow dom styles", e);
              }
            }, 500);

            const scrollPlugin = registry.getCapabilityProvider('scroll');
            if (scrollPlugin && typeof scrollPlugin.provides === 'function') {
              const scrollCap = scrollPlugin.provides();
              scrollCapRef.current = scrollCap;
              
              if (scrollCap) {
                // Wait for the PDF layout to be ready before scrolling!
                if (typeof scrollCap.onLayoutReady === 'function') {
                  scrollCap.onLayoutReady((e: any) => {
                    if (e && e.isInitial) {
                      if (initialPageRef.current && initialPageRef.current > 1 && scrollCap.scrollToPage) {
                         // Small delay to ensure rendering completes
                         setTimeout(() => {
                           scrollCap.scrollToPage({ pageNumber: initialPageRef.current!, behavior: 'instant' });
                         }, 100);
                      }
                    }
                  });
                }
                
                // Track page changes
                if (typeof scrollCap.onPageChange === 'function') {
                  scrollCap.onPageChange((e: any) => {
                    if (e && e.pageNumber) {
                      setCurrentPage(e.pageNumber);
                    }
                  });
                }
              }
            }
          } catch (err) {
            console.error("Error setting up embedpdf scroll listener:", err);
            setIsReady(true);
          }
        }}
      />
    </div>
  );
}
