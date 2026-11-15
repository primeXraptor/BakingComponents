import { useEffect, useRef, useState, type RefObject } from "react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";

type Props = {
  pdf: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  initialSize: { width: number; height: number };
  root: RefObject<HTMLDivElement | null>;
};

export default function PdfPage({ pdf, pageNumber, scale, initialSize, root }: Props) {
  const holder = useRef<HTMLDivElement>(null);
  const [nearby, setNearby] = useState(false);
  const [size, setSize] = useState(initialSize);
  const [renderStatus, setRenderStatus] = useState({ scale, message: "Loading page…" });
  const status = renderStatus.scale === scale ? renderStatus.message : "Loading page…";
  const [text, setText] = useState("");
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setNearby(entry.isIntersecting), {
      root: root.current,
      rootMargin: "800px 0px",
    });
    if (holder.current) observer.observe(holder.current);
    return () => observer.disconnect();
  }, [root]);
  useEffect(() => {
    if (!nearby) return;
    let cancelled = false;
    let task: RenderTask | undefined;
    // Each render owns its canvas, so a cancelled zoom render cannot overwrite a newer one.
    const canvas = document.createElement("canvas");
    canvas.className = "bc-page";
    canvas.setAttribute("aria-hidden", "true");
    async function render() {
      try {
        const page = await pdf.getPage(pageNumber);
        if (cancelled) return;
        const natural = page.getViewport({ scale: 1 });
        setSize({ width: natural.width, height: natural.height });
        const viewport = page.getViewport({ scale });
        const ratio = Math.min(
          window.devicePixelRatio || 1,
          2,
          Math.sqrt(8_000_000 / (viewport.width * viewport.height)),
          8192 / Math.max(viewport.width, viewport.height),
        );
        canvas.width = Math.max(1, Math.floor(viewport.width * ratio));
        canvas.height = Math.max(1, Math.floor(viewport.height * ratio));
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        const context = canvas.getContext("2d", { alpha: false });
        if (!context) throw new Error("Canvas unavailable");
        holder.current?.prepend(canvas);
        task = page.render({
          canvas,
          canvasContext: context,
          viewport,
          transform: [ratio, 0, 0, ratio, 0, 0],
        });
        await task.promise;
        if (cancelled) return;
        setRenderStatus({ scale, message: "" });
        const content = await page.getTextContent();
        if (!cancelled)
          setText(content.items.map((item) => ("str" in item ? item.str : "")).join(" "));
      } catch (error) {
        if (!cancelled && !(error instanceof Error && error.name === "RenderingCancelledException"))
          setRenderStatus({ scale, message: "This page could not be displayed." });
      }
    }
    void render();
    return () => {
      cancelled = true;
      task?.cancel();
      canvas.remove();
      canvas.width = 0;
      canvas.height = 0;
    };
  }, [nearby, pdf, pageNumber, scale]);
  return (
    <div
      ref={holder}
      className="bc-page-wrap"
      role="group"
      aria-label={`Page ${pageNumber} of ${pdf.numPages}`}
      style={{ width: size.width * scale, height: size.height * scale }}
    >
      {nearby && status && (
        <div className="bc-page-loading" role="status" aria-label={status}>
          {status === "Loading page…" ? <span className="bc-spinner" aria-hidden="true" /> : status}
        </div>
      )}
      <span className="bc-sr-only">{text || "PDF page"}</span>
      <span className="bc-sr-only">© 2026 BreadCrumb Developers</span>
    </div>
  );
}
