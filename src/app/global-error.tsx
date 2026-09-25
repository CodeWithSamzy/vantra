"use client";

// Replaces the root layout entirely, so it must render its own html/body and
// cannot rely on globals.css being loaded - hence the inline styles.
export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#fafaf7",
          color: "#12151c",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
        }}
      >
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 24px",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: "22rem" }}>
            <p
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: "1.25rem",
                margin: 0,
              }}
            >
              Vantra
            </p>
            <h1
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: "1.5rem",
                margin: "2rem 0 0",
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                margin: "0.5rem 0 0",
                fontSize: "0.875rem",
                lineHeight: 1.6,
                color: "#6b6a64",
              }}
            >
              The app hit an unexpected error. Please try again.
            </p>
            <button
              type="button"
              onClick={() => retry()}
              style={{
                marginTop: "1.5rem",
                background: "#12151c",
                color: "#fafaf7",
                border: "none",
                borderRadius: "0.375rem",
                padding: "0.5rem 1rem",
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}