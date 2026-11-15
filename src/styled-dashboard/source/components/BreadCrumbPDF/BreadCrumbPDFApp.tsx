"use client";
import {useDashboardRuntime} from "../../../runtime/context";

import BreadCrumbPdfViewer from "./BreadCrumbPdfViewer";

interface BreadCrumbPDFAppProps {
  src?: string;
  fileName?: string;
}

export default function App({
  src = "/RR.pdf",
  fileName = "Rules & Regulations.pdf",
}: BreadCrumbPDFAppProps) {
  const {pdfAssetsUrl,pdfWorkerUrl}=useDashboardRuntime();
  return <BreadCrumbPdfViewer src={src} fileName={fileName} assetsUrl={pdfAssetsUrl ?? new URL("./pdf-assets/", import.meta.url).href} workerSrc={pdfWorkerUrl} allowDownload />;
}
