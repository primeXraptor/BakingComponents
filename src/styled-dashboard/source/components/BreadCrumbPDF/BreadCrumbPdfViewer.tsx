"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from "pdfjs-dist";
import PdfPage from "./PdfPage";
import "./BreadCrumbPdfViewer.css";

export type BreadCrumbPdfViewerProps = {
  src: string;
  fileName?: string;
  allowDownload?: boolean;
  workerSrc?: string;
  className?: string;
  /** Public directory containing the matching PDF.js worker, fonts, CMaps and WASM. */
  assetsUrl?: string;
};

type FitMode = "reading" | "page" | "width" | null;
type PageSize = { width: number; height: number };
type StageSize = { width: number; height: number };

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

function Icon({ children, size = 18 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function subscribeToFullscreen(onChange: () => void) {
  document.addEventListener("fullscreenchange", onChange);
  return () => document.removeEventListener("fullscreenchange", onChange);
}

function getFullscreenSupport() {
  return Boolean(document.fullscreenEnabled);
}

function getServerFullscreenSupport() {
  return false;
}

export default function BreadCrumbPdfViewer(props: BreadCrumbPdfViewerProps) {
  // A new document gets fresh state, rather than resetting state inside effects.
  const documentKey = JSON.stringify([props.src, props.workerSrc, props.assetsUrl]);
  return <PdfViewerDocument key={documentKey} {...props} />;
}

function PdfViewerDocument({
  src,
  fileName = "RR.pdf",
  allowDownload = false,
  workerSrc,
  assetsUrl = "/BreadCrumbPDF/",
  className = "",
}: BreadCrumbPdfViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [pageSize, setPageSize] = useState<PageSize | null>(null);
  const [stageSize, setStageSize] = useState<StageSize>({ width: 0, height: 0 });
  const [fitMode, setFitMode] = useState<FitMode>("reading");
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState("");
  const fullscreenSupported = useSyncExternalStore(
    subscribeToFullscreen,
    getFullscreenSupport,
    getServerFullscreenSupport,
  );

  useEffect(() => {
    let cancelled = false;
    let loadingTask: PDFDocumentLoadingTask | null = null;

    import("pdfjs-dist")
      .then(({ getDocument, GlobalWorkerOptions }) => {
        if (cancelled) return;
        GlobalWorkerOptions.workerSrc =
          workerSrc ?? `${assetsUrl.replace(/\/?$/, "/")}pdf.worker.min.mjs`;
        const base = assetsUrl.replace(/\/?$/, "/");
        loadingTask = getDocument({
          url: src,
          cMapUrl: `${base}cmaps/`,
          cMapPacked: true,
          standardFontDataUrl: `${base}standard_fonts/`,
          wasmUrl: `${base}wasm/`,
        });
        loadingTask.promise.then(
          async (document) => {
            if (cancelled) return;
            try {
              const firstPage = await document.getPage(1);
              if (cancelled) return;
              const viewport = firstPage.getViewport({ scale: 1 });
              setPageSize({ width: viewport.width, height: viewport.height });
              setPdf(document);
            } catch {
              if (!cancelled) setError("This PDF page couldn't be opened.");
            }
          },
          () => {
            if (!cancelled)
              setError("We couldn't open this PDF. Check the file URL and try again.");
          },
        );
      })
      .catch(() => {
        if (!cancelled) setError("The PDF viewer couldn't start. Please try again.");
      });

    return () => {
      cancelled = true;
      if (loadingTask) void loadingTask.destroy().catch(() => {});
    };
  }, [src, workerSrc, assetsUrl, retryCount]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setStageSize({ width, height });
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const scale = useMemo(() => {
    if (!fitMode || !pageSize || !stageSize.width || !stageSize.height) return zoom;
    const fitWidth = (stageSize.width - 16) / pageSize.width;
    const fitPage = Math.min(fitWidth, (stageSize.height - 16) / pageSize.height);
    const reading = Math.min(680, stageSize.width - 32) / pageSize.width;
    const target = fitMode === "width" ? fitWidth : fitMode === "page" ? fitPage : reading;
    return clamp(target, 0.35, MAX_ZOOM);
  }, [fitMode, pageSize, stageSize, zoom]);

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(document.fullscreenElement === viewerRef.current);
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  function retryDocument() {
    setPdf(null);
    setPageSize(null);
    setError(null);
    stageRef.current?.scrollTo({ top: 0, left: 0 });
    setRetryCount((count) => count + 1);
  }

  function changeZoom(direction: -1 | 1) {
    setZoom(
      clamp(
        Math.round((scale + direction * ZOOM_STEP) / ZOOM_STEP) * ZOOM_STEP,
        MIN_ZOOM,
        MAX_ZOOM,
      ),
    );
    setFitMode(null);
  }

  async function toggleFullscreen() {
    try {
      setFullscreenError("");
      if (document.fullscreenElement === viewerRef.current) await document.exitFullscreen();
      else await viewerRef.current?.requestFullscreen();
    } catch {
      setFullscreenError("Fullscreen is unavailable in this browser or embedded view.");
    }
  }

  function handleStageKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      changeZoom(1);
    } else if (event.key === "-") {
      event.preventDefault();
      changeZoom(-1);
    }
  }

  return (
    <div className={`bc-viewer ${className}`.trim()} ref={viewerRef}>
      <section className="bc-shell" aria-label={`PDF viewer: ${fileName}`}>
        <header className="bc-header">
          <div className="bc-file" title={fileName}>
            <Icon size={15}>
              <path d="M7 3h7l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
              <path d="M14 3v5h5" />
            </Icon>
            <span>{fileName}</span>
          </div>
        </header>

        <div
          className="bc-stage"
          ref={stageRef}
          tabIndex={0}
          onKeyDown={handleStageKeyDown}
          role="region"
          aria-label="PDF document. Scroll to read all pages."
        >
          {error ? (
            <div className="bc-message" role="alert">
              <div className="bc-message__icon">!</div>
              <strong>Document unavailable</strong>
              <p>{error}</p>
              <button type="button" onClick={retryDocument}>
                Try again
              </button>
            </div>
          ) : (
            <div className="bc-pages" key={`${src}-${retryCount}`}>
              {!pdf || !pageSize ? (
                <div className="bc-loading" role="status" aria-label="Loading document">
                  <span className="bc-spinner" aria-hidden="true" />
                </div>
              ) : (
                Array.from({ length: pdf.numPages }, (_, index) => (
                  <PdfPage
                    key={index + 1}
                    pdf={pdf}
                    pageNumber={index + 1}
                    scale={scale}
                    initialSize={pageSize}
                    root={stageRef}
                  />
                ))
              )}
            </div>
          )}
        </div>

        {fullscreenError && (
          <div className="bc-notice" role="status">
            {fullscreenError}
          </div>
        )}
        <nav className="bc-toolbar" aria-label="PDF viewer controls">
          <button
            className="bc-tool"
            type="button"
            onClick={() => changeZoom(-1)}
            disabled={!pdf || scale <= MIN_ZOOM}
            aria-label="Zoom out"
            title="Zoom out"
          >
            <Icon>
              <path d="M5 12h14" />
            </Icon>
          </button>
          <span className="bc-zoom-label" aria-live="polite">
            {Math.round(scale * 100)}%
          </span>
          <button
            className="bc-tool"
            type="button"
            onClick={() => changeZoom(1)}
            disabled={!pdf || scale >= MAX_ZOOM}
            aria-label="Zoom in"
            title="Zoom in"
          >
            <Icon>
              <path d="M5 12h14M12 5v14" />
            </Icon>
          </button>
          <span className="bc-divider" aria-hidden="true" />
          <button
            className={`bc-tool ${fitMode === "page" ? "bc-tool--active" : ""}`}
            type="button"
            onClick={() => setFitMode("page")}
            disabled={!pdf}
            aria-label="Fit page"
            title="Fit page"
          >
            <Icon>
              <path d="M8 4H4v4m12-4h4v4M4 16v4h4m12-4v4h-4" />
              <rect x="8" y="7" width="8" height="10" rx="1" />
            </Icon>
          </button>
          <button
            className={`bc-tool bc-tool--fit-width ${fitMode === "width" ? "bc-tool--active" : ""}`}
            type="button"
            onClick={() => setFitMode("width")}
            disabled={!pdf}
            aria-label="Fit width"
            title="Fit width"
          >
            <Icon>
              <path d="M4 7v10m16-10v10M8 12h8m-3-3 3 3-3 3m-2-6-3 3 3 3" />
            </Icon>
          </button>
          <button
            className="bc-tool"
            type="button"
            onClick={toggleFullscreen}
            disabled={!fullscreenSupported}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            <Icon>
              <path d="M8 4H4v4m12-4h4v4M4 16v4h4m12-4v4h-4" />
            </Icon>
          </button>
          {allowDownload && (
            <>
              <span className="bc-divider" aria-hidden="true" />
              <a
                className="bc-tool bc-tool--download"
                href={src}
                download={fileName}
                aria-label="Download PDF"
                title="Download PDF"
              >
                <Icon>
                  <path d="M12 3v12m-4-4 4 4 4-4M4 17v3h16v-3" />
                </Icon>
              </a>
            </>
          )}
        </nav>
      </section>
    </div>
  );
}
