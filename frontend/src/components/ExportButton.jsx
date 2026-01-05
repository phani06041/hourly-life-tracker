import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ExportButton({
  url,
  filename = "export",
  hasUnsavedChanges = false
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  /* ---------- CLOSE ON OUTSIDE CLICK ---------- */
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ---------- BACKEND EXPORT (CSV / XLSX) ---------- */
  const exportBackend = (format) => {
    if (hasUnsavedChanges) {
      const ok = window.confirm(
        "⚠️ You have UNSAVED changes.\n\nExport will use LAST SAVED data.\n\nContinue?"
      );
      if (!ok) return;
    }

    const separator = url.includes("?") ? "&" : "?";
    const fullUrl = url.startsWith("http")
      ? url
      : `http://localhost:5001${url}`;

    window.open(`${fullUrl}${separator}format=${format}`, "_blank");
    setOpen(false);
  };

  /* ---------- FRONTEND PDF EXPORT (UI SNAPSHOT) ---------- */
const exportPDF = async () => {
  if (hasUnsavedChanges) {
    alert(
      "❌ You have UNSAVED changes.\n\n" +
      "PDF export is disabled to prevent exporting incorrect data.\n\n" +
      "Please SAVE first."
    );
    return;
  }

  setOpen(false);

  const element = document.getElementById("export-area");
  if (!element) {
    alert("Export area not found");
    return;
  }

  await new Promise((r) => requestAnimationFrame(r));

  const canvas = await html2canvas(element, {
    scale: 1.5,
    backgroundColor: "#ffffff",
    useCORS: true
  });

  const imgData = canvas.toDataURL("image/jpeg", 0.95);

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgHeight = (canvas.height * pageWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "JPEG", 0, position, pageWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(`${filename}.pdf`);
};


  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          padding: "6px 14px",
          borderRadius: 6,
          border: "1px solid #ccc",
          background: "#08c30ed8",
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        Export ⬇
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "110%",
            right: 0,
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: 6,
            minWidth: 160,
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            zIndex: 1000
          }}
        >
          <button onClick={() => exportBackend("csv")}>📄 CSV</button>
          <button onClick={() => exportBackend("xlsx")}>📊 Excel</button>
          <button onClick={exportPDF}>📕 PDF</button>
        </div>
      )}
    </div>
  );
}
