export default function FeedbackBar({
  message,
}: {
  message: string;
}) {
  return (
    <div
      style={{
        fontSize: 18,
        fontWeight: 500,
        letterSpacing: 0.5,
      }}
    >
      {message}
    </div>
  );
}
