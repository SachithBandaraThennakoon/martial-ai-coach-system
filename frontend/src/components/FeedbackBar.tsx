export default function FeedbackBar({
  message,
}: {
  message: string;
}) {
  return (
    <div
      style={{
        height: "50px",
        background: "#111",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        paddingLeft: "16px",
        fontSize: "18px",
        fontWeight: 500,
      }}
    >
      {message}
    </div>
  );
}
