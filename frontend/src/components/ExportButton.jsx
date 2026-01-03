export default function ExportButton({ url }) {
  return (
    <button
      onClick={() => window.location.href = url}
      style={{
        marginLeft: "auto",
        background: "#28a745",
        color: "#fff",
        padding: "6px 14px",
        borderRadius: 6,
        border: "none"
      }}
    >
      ⬇ Export
    </button>
  );
}
