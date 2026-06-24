import { useState } from "react";

const BG = "#0f0f0f";
const TEXT = "#e8e6e1";
const MUTED = "#888";
const ACCENT = "#EF9F27";
const BORDER = "#2a2a2a";
const SURFACE = "#161616";
const SERIF = 'Georgia, "Times New Roman", serif';
const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const SENTIMENT_COLORS = {
  positive: "#22c55e",
  negative: "#ef4444",
  mixed: ACCENT,
  neutral: "#6b7280",
};

const SYSTEM_PROMPT = `You are a senior e-commerce analyst specializing in Amazon product reviews. When given one or more reviews, you extract structured insights with clinical precision.
Always respond with a single valid JSON object, no markdown, no preamble, no explanation outside the JSON. The structure must be exactly:
{
  "sentiment": "positive" | "negative" | "mixed" | "neutral",
  "score_estimate": 1 | 2 | 3 | 4 | 5,
  "confidence": 0.0–1.0,
  "one_line_summary": "string (max 15 words)",
  "pros": ["string", ...],
  "cons": ["string", ...],
  "red_flags": ["string", ...],
  "buyer_profile": "string (who would benefit from this product)",
  "verified_signals": ["phrases that suggest genuine purchase experience"]
}
Rules:
- pros and cons: max 5 items each, actionable and specific (not generic)
- red_flags: suspicious patterns (fake review signals, paid promotion language, vague praise)
- score_estimate: infer from sentiment if no star rating is given
- confidence: how certain you are in your analysis (0.0 = guessing, 1.0 = very clear signal)
- If multiple reviews are pasted, analyze them as a corpus, not individually
- Never hallucinate product details not mentioned in the review text`;

const PLACEHOLDER = `Paste one or more Amazon reviews here. Example:

★★★★☆ — "Great headphones for the price"
I've been using these for about three weeks now. Sound quality is surprisingly good for the $45 price point — bass is punchy without being overwhelming. The ear cups are comfortable enough for 2-hour sessions but start to feel warm after that. Build quality feels a bit plastic-y, though the hinges seem solid. Battery lasts around 18 hours which matches the claim. Pairing is fast. My only gripe is the included cable is too short. Bought these after my $120 pair broke — honestly can't justify going back.`;

function Spinner() {
  return (
    <>
      <style>{`@keyframes ra-spin { to { transform: rotate(360deg); } }`}</style>
      <span
        style={{
          display: "inline-block",
          width: 14,
          height: 14,
          border: "2px solid #333",
          borderTopColor: ACCENT,
          borderRadius: "50%",
          animation: "ra-spin 0.7s linear infinite",
          verticalAlign: "middle",
          marginRight: 8,
        }}
      />
    </>
  );
}

function SentimentBadge({ sentiment }) {
  const color = SENTIMENT_COLORS[sentiment] || MUTED;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 12px",
        borderRadius: 20,
        border: `1px solid ${color}`,
        background: color + "22",
        color,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      {sentiment}
    </span>
  );
}

function StarScore({ score }) {
  return (
    <span style={{ fontSize: 22, letterSpacing: 2 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < score ? ACCENT : BORDER }}>
          ★
        </span>
      ))}
    </span>
  );
}

function ConfidenceBar({ confidence }) {
  const pct = Math.round(confidence * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          flex: 1,
          background: BORDER,
          height: 4,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: ACCENT,
            width: `${pct}%`,
            height: "100%",
            borderRadius: 2,
            transition: "width 0.6s ease",
          }}
        />
      </div>
      <span style={{ fontSize: 12, color: MUTED, minWidth: 34 }}>{pct}%</span>
    </div>
  );
}

function ResultPanel({ result }) {
  const {
    sentiment,
    score_estimate,
    confidence,
    one_line_summary,
    pros = [],
    cons = [],
    red_flags = [],
    buyer_profile,
    verified_signals = [],
  } = result;

  return (
    <div
      style={{
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
        padding: 28,
        marginTop: 32,
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        <SentimentBadge sentiment={sentiment} />
        <StarScore score={score_estimate} />
      </div>

      {/* Confidence */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{ fontSize: 11, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}
        >
          Confidence
        </div>
        <ConfidenceBar confidence={confidence} />
      </div>

      {/* One-line summary */}
      <div
        style={{
          borderLeft: `3px solid ${ACCENT}`,
          paddingLeft: 16,
          marginBottom: 28,
        }}
      >
        <p
          style={{
            fontFamily: SERIF,
            fontSize: 20,
            lineHeight: 1.5,
            color: TEXT,
            margin: 0,
          }}
        >
          {one_line_summary}
        </p>
      </div>

      {/* Pros / Cons */}
      {(pros.length > 0 || cons.length > 0) && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            marginBottom: 24,
          }}
        >
          {pros.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: MUTED,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                Pros
              </div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {pros.map((p, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      gap: 8,
                      marginBottom: 8,
                      fontSize: 14,
                      color: TEXT,
                      lineHeight: 1.4,
                    }}
                  >
                    <span style={{ color: "#22c55e", flexShrink: 0, marginTop: 1 }}>✓</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {cons.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: MUTED,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                Cons
              </div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {cons.map((c, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      gap: 8,
                      marginBottom: 8,
                      fontSize: 14,
                      color: TEXT,
                      lineHeight: 1.4,
                    }}
                  >
                    <span style={{ color: "#ef4444", flexShrink: 0, marginTop: 1 }}>✗</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Red flags */}
      {red_flags.length > 0 && (
        <div
          style={{
            background: "rgba(124, 58, 0, 0.3)",
            border: `1px solid ${ACCENT}`,
            borderRadius: 6,
            padding: 14,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: ACCENT,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 8,
              fontWeight: 600,
            }}
          >
            Red Flags
          </div>
          {red_flags.map((f, i) => (
            <p
              key={i}
              style={{ margin: "0 0 4px", fontSize: 13, color: "#f5c67a" }}
            >
              ⚠ {f}
            </p>
          ))}
        </div>
      )}

      {/* Buyer profile */}
      {buyer_profile && (
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 11,
              color: MUTED,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Buyer Profile
          </div>
          <p
            style={{
              fontFamily: SERIF,
              fontSize: 14,
              color: MUTED,
              fontStyle: "italic",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {buyer_profile}
          </p>
        </div>
      )}

      {/* Verified signals */}
      {verified_signals.length > 0 && (
        <div>
          <div
            style={{
              fontSize: 11,
              color: MUTED,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Verified Signals
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {verified_signals.map((s, i) => (
              <span
                key={i}
                style={{
                  background: "#1a1a1a",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 20,
                  padding: "4px 12px",
                  fontSize: 12,
                  color: MUTED,
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryList({ history, onSelect }) {
  if (!history.length) return null;
  return (
    <div style={{ marginTop: 40 }}>
      <div
        style={{
          fontSize: 11,
          color: MUTED,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        Recent Analyses
      </div>
      {history.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.result)}
          style={{
            display: "block",
            width: "100%",
            textAlign: "left",
            padding: "10px 14px",
            background: "transparent",
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            color: TEXT,
            cursor: "pointer",
            marginBottom: 8,
            fontFamily: SANS,
            fontSize: 13,
            transition: "border-color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = ACCENT)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}
        >
          <span style={{ color: MUTED }}>{item.snippet}</span>
          <span
            style={{
              float: "right",
              fontSize: 11,
              color: SENTIMENT_COLORS[item.result.sentiment] || MUTED,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {item.result.sentiment}
          </span>
        </button>
      ))}
    </div>
  );
}

export default function ReviewAnalyzerPage() {
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [rawError, setRawError] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const analyze = async () => {
    if (!reviewText.trim()) return;
    setLoading(true);
    setResult(null);
    setRawError(null);
    setError(null);

    const userPrompt = `Analyze the following Amazon review(s) and return the JSON:\n---REVIEW START---\n${reviewText}\n---REVIEW END---`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": process.env.REACT_APP_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`API error ${res.status}: ${errBody}`);
      }

      const data = await res.json();
      const text = data.content[0].text;

      try {
        const parsed = JSON.parse(text);
        setResult(parsed);
        setHistory((prev) =>
          [
            {
              id: Date.now(),
              snippet: reviewText.slice(0, 70) + (reviewText.length > 70 ? "…" : ""),
              result: parsed,
            },
            ...prev,
          ].slice(0, 5)
        );
      } catch {
        setRawError(text);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: BG,
        minHeight: "100vh",
        color: TEXT,
        fontFamily: SANS,
      }}
    >
      <div
        style={{
          maxWidth: 680,
          margin: "0 auto",
          padding: "48px 24px 80px",
        }}
      >
        {/* Header */}
        <header style={{ marginBottom: 40 }}>
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: ACCENT,
              marginBottom: 10,
            }}
          >
            Amazon Review Intelligence
          </p>
          <h1
            style={{
              fontFamily: SERIF,
              fontSize: 32,
              fontWeight: 400,
              color: TEXT,
              margin: "0 0 10px",
              lineHeight: 1.2,
            }}
          >
            Review Analyzer
          </h1>
          <p style={{ color: MUTED, fontSize: 14, margin: 0, lineHeight: 1.6 }}>
            Paste one or more Amazon reviews to extract structured sentiment,
            pros, cons, red flags, and buyer insights.
          </p>
        </header>

        {/* Textarea */}
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder={PLACEHOLDER}
          rows={10}
          style={{
            width: "100%",
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            color: TEXT,
            fontFamily: SANS,
            fontSize: 14,
            lineHeight: 1.6,
            padding: 14,
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => (e.target.style.borderColor = ACCENT)}
          onBlur={(e) => (e.target.style.borderColor = BORDER)}
        />

        {/* Analyze button */}
        <div style={{ marginTop: 14 }}>
          <button
            onClick={analyze}
            disabled={loading || !reviewText.trim()}
            style={{
              background: loading || !reviewText.trim() ? "#2a2200" : ACCENT,
              color: loading || !reviewText.trim() ? "#7a6020" : "#0f0f0f",
              border: "none",
              borderRadius: 6,
              padding: "11px 28px",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: SANS,
              cursor: loading || !reviewText.trim() ? "not-allowed" : "pointer",
              transition: "background 0.15s, color 0.15s",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            {loading && <Spinner />}
            {loading ? "Analyzing…" : "Analyze"}
          </button>
        </div>

        {/* Network/API error */}
        {error && (
          <div
            style={{
              marginTop: 20,
              background: "rgba(120, 0, 0, 0.25)",
              border: "1px solid #ef4444",
              borderRadius: 6,
              padding: 14,
              fontSize: 13,
              color: "#fca5a5",
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Raw parse failure */}
        {rawError && (
          <div
            style={{
              marginTop: 20,
              background: SURFACE,
              border: `1px solid ${ACCENT}`,
              borderRadius: 6,
              padding: 14,
            }}
          >
            <p
              style={{
                margin: "0 0 10px",
                fontSize: 12,
                color: ACCENT,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              ⚠ Could not parse JSON — showing raw response
            </p>
            <pre
              style={{
                margin: 0,
                fontSize: 12,
                color: MUTED,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                fontFamily: "monospace",
              }}
            >
              {rawError}
            </pre>
          </div>
        )}

        {/* Result */}
        {result && <ResultPanel result={result} />}

        {/* History */}
        <HistoryList
          history={history}
          onSelect={(r) => {
            setResult(r);
            setRawError(null);
            setError(null);
          }}
        />
      </div>
    </div>
  );
}
