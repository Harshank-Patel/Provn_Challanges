import { useState } from "react";
import api from "./services/api";
import ResultsChart from "./components/ResultsChart";

function App() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultType, setResultType] = useState<
    "vendors" | "agencies" | "categories" | ""
  >("");

  const [question, setQuestion] = useState("");

  const [querySpec, setQuerySpec] = useState<any>(null);

  const [summary, setSummary] = useState("");

  const suggestions = [
    "Top vendors",
    "Largest agencies",
    "Transportation spending",
    "Health Care Authority",
  ];

  const loadTopVendors = async () => {
    try {
      setLoading(true);
      setResultType("vendors");

      const response = await api.post("/query", {
        filters: {
          agency: "Health Care Authority",
        },
        group_by: ["vendor"],
        limit: 10,
      });

      setResults(response.data.results);
    } catch (err) {
      console.error(err);
      alert("Failed to load vendor data");
    } finally {
      setLoading(false);
    }
  };

  const loadTopAgencies = async () => {
    try {
      setLoading(true);
      setResultType("agencies");

      const response = await api.get("/top-agencies");
      console.log(
        JSON.stringify(
          response.data.results[0],
          null,
          2
        )
      );
      setResults(response.data.results);
    } catch (err) {
      console.error(err);
      alert("Failed to load agency data");
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async (
    questionOverride?: string
  ) => {

    console.log(
      "questionOverride:",
      questionOverride
    );

    console.log(
      "question:",
      question
    );

    const finalQuestion =
      questionOverride ??
      question;

    console.log(
      "finalQuestion:",
      finalQuestion
    );

    if (
      typeof finalQuestion !== "string"
    ) {
      console.error(
        "finalQuestion is not a string"
      );
      return;
    }

    if (!finalQuestion.trim())
      return;

    try {

      setLoading(true);

      const response =
        await api.post(
          "/ask",
          {
            question:
              finalQuestion,
          }
        );

      console.log(
        "AI response:",
        response.data
      );

      const query =
        response.data.query;

      setQuerySpec(query);

      setSummary(

        response.data.summary ?? ""

      );

      if (
        query.group_by?.includes(
          "category"
        )
      ) {

        setResultType(
          "categories"
        );

      } else if (
        query.group_by?.includes(
          "agency"
        )
      ) {

        setResultType(
          "agencies"
        );

      } else if (
        query.group_by?.includes(
          "vendor"
        )
      ) {

        setResultType(
          "vendors"
        );

      }

      setResults(
        response.data.results
      );

    } catch (err) {

      console.error(
        "ASK ERROR:",
        err
      );

      alert(
        "Failed to process question."
      );

    } finally {

      setLoading(false);

    }
  };

  const handleSuggestionClick = (
    item: string
  ) => {

    switch (item) {

      case "Top vendors":
        askQuestion(
          "top vendors for health care authority"
        );
        break;

      case "Largest agencies":
        askQuestion(
          "largest agencies"
        );
        break;

      case "Transportation spending":
        askQuestion(
          "transportation spending by category"
        );
        break;

      case "Health Care Authority":
        askQuestion(
          "top vendors for health care authority"
        );
        break;

      default:
        break;
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        color: "white",
        display: "flex",
        justifyContent: "center",
        padding: "4rem 2rem",
        position: "relative",
      }}
    >
      <div className="hero-glow" />

      <div
        style={{
          width: "100%",
          maxWidth: "1100px",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            marginBottom: "1rem",
            color: "#777",
            letterSpacing: "3px",
            textTransform: "uppercase",
            fontSize: "0.85rem",
          }}
        >
          Provn Challenge
        </div>

        <h1
          className="gradient-text"
          style={{
            fontSize: "5rem",
            fontWeight: 800,
            lineHeight: 1.05,
            marginBottom: "1rem",
          }}
        >
          Explore Public
          <br />
          Spending Through AI
        </h1>

        <p
          style={{
            color: "#8a8a8a",
            fontSize: "1.2rem",
            marginBottom: "2rem",
          }}
        >
          Ask questions about government spending in plain English.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "3rem",
          }}
        >
          <div className="stats-badge">
            📊 451,029 Transactions
          </div>

          <div className="stats-badge">
            🏢 100 Agencies
          </div>

          <div className="stats-badge">
            📅 FY 2022
          </div>
        </div>

        <div
          style={{
            maxWidth: "950px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "12px",
            }}
          >
            <input
              className="search-box"
              placeholder="Ask anything about government spending..."
              value={question}
              onChange={(e) =>
                setQuestion(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  askQuestion();
                }
              }}
            />

            <button
              onClick={() => askQuestion()}
              style={{
                width: "140px",
                borderRadius: "20px",
                border: "none",
                background: "white",
                color: "black",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              Search
            </button>
          </div>
        </div>

        {querySpec && (
          <div
            style={{
              marginTop: "1rem",
              textAlign: "left",
              background: "#111",
              border: "1px solid #222",
              borderRadius: "16px",
              padding: "16px",
              color: "#aaa",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                color: "white",
                marginBottom: "8px",
                fontWeight: 600,
              }}
            >
              AI Generated Query
            </div>

            <pre>
              {JSON.stringify(
                querySpec,
                null,
                2
              )}
            </pre>
          </div>
        )}

        <div
          style={{
            marginTop: "2rem",
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          {suggestions.map((item) => (
            <div
              key={item}
              className="quick-card"
              onClick={() =>
                handleSuggestionClick(item)
              }
            >
              {item}
            </div>
          ))}
        </div>

        <div className="results-panel">
          <div
            style={{
              fontSize: "1.1rem",
              fontWeight: 600,
              marginBottom: "1rem",
            }}
          >
            Results
          </div>

          {loading && (
            <div
              style={{
                color: "#888",
              }}
            >
              Loading...
            </div>
          )}

          {!loading && results.length === 0 && (
            <div
              style={{
                color: "#888",
              }}
            >
              Click a card above to run a live query.
            </div>
          )}

          {!loading &&

            results.length > 0 && (



              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "16px",
                    marginBottom: "24px",
                  }}
                >
                  <div className="quick-card">
                    <div
                      style={{
                        color: "#888",
                        fontSize: "0.9rem",
                        marginBottom: "8px",
                      }}
                    >
                      Total Spend
                    </div>

                    <div
                      style={{
                        fontSize: "1.8rem",
                        fontWeight: 700,
                      }}
                    >
                      $
                      {Math.round(
                        results.reduce(
                          (sum, row) =>
                            sum + row.totalAmount,
                          0
                        )
                      ).toLocaleString()}
                    </div>
                  </div>

                  <div className="quick-card">
                    <div
                      style={{
                        color: "#888",
                        fontSize: "0.9rem",
                        marginBottom: "8px",
                      }}
                    >
                      Results Returned
                    </div>

                    <div
                      style={{
                        fontSize: "1.8rem",
                        fontWeight: 700,
                      }}
                    >
                      {results.length}
                    </div>
                  </div>

                  <div className="quick-card">
                    <div
                      style={{
                        color: "#888",
                        fontSize: "0.9rem",
                        marginBottom: "8px",
                      }}
                    >
                      Top Result
                    </div>

                    <div
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {resultType === "vendors"
                        ? results[0]?._id?.vendor
                        : resultType === "categories"
                          ? results[0]?._id?.category
                          : results[0]?._id?.agency}
                    </div>
                  </div>
                </div>

                {summary && (
                  <div
                    className="results-panel"
                    style={{
                      marginBottom: "1.5rem",
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        marginBottom: "12px",
                        fontSize: "1.1rem",
                      }}
                    >
                      AI Insights
                    </div>

                    <div
                      style={{
                        color: "#b3b3b3",
                        lineHeight: 1.8,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {summary}
                    </div>
                  </div>
                )}

                <ResultsChart
                  data={results}
                  resultType={resultType}
                />

                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    textAlign: "left",
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          paddingBottom: "16px",
                        }}
                      >
                        {resultType === "vendors"
                          ? "Vendor"
                          : resultType === "categories"
                            ? "Category"
                            : "Agency"}
                      </th>

                      <th
                        style={{
                          textAlign: "right",
                          paddingBottom: "16px",
                        }}
                      >
                        Amount
                      </th>

                      <th
                        style={{
                          textAlign: "right",
                          paddingBottom: "16px",
                        }}
                      >
                        Transactions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {results.map((row, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderTop:
                            "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <td
                          style={{
                            padding: "14px 0",
                          }}
                        >
                          {resultType === "vendors"
                            ? row?._id?.vendor
                            : resultType === "categories"
                              ? row?._id?.category
                              : row?._id?.agency}
                        </td>

                        <td
                          style={{
                            textAlign: "right",
                          }}
                        >
                          $
                          {Math.round(
                            row.totalAmount
                          ).toLocaleString()}
                        </td>

                        <td
                          style={{
                            textAlign: "right",
                          }}
                        >
                          {(
                            row.transactionCount ?? 0
                          ).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
        </div>
      </div>
    </div>
  );
}

export default App;