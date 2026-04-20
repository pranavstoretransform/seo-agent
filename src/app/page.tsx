"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { auditPage } from "@/lib/seoAudit";

export default function Home() {
  const [url, setUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const [pages, setPages] = useState<any[]>([]);
  const [auditedPages, setAuditedPages] = useState<any[]>([]);

  const [showErrorPopup, setShowErrorPopup] = useState(false);

  // AI STATES
  const [suggestions, setSuggestions] = useState<any>({});
  const [loadingSuggestion, setLoadingSuggestion] = useState<number | null>(null);
  const [seoPlugin, setSeoPlugin] = useState<"yoast" | "rankmath" | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [updatedPages, setUpdatedPages] = useState<number[]>([]);

  // STATS
  const totalPages = auditedPages.length;

  const totalIssues = auditedPages.reduce(
    (sum, page) => sum + page.issues.length,
    0
  );

  const overallScore =
    auditedPages.length > 0
      ? Math.round(
        auditedPages.reduce((sum, page) => sum + page.score, 0) /
        auditedPages.length
      )
      : 0;

  const optimizedPages = auditedPages.filter(
    (page) => page.score >= 70
  ).length;


  // FETCH PAGES

  const fetchPages = async (
    url: string,
    username: string,
    password: string
  ) => {
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, username, password }),
      });

      const data = await res.json();

      if (data.success) {
        setPages(data.pages);
        setSeoPlugin(data.plugin || null);

        const audited = data.pages.map((page: any) => {
          const audit = auditPage(page);
          return {
            ...page,
            score: audit.score,
            issues: audit.issues,
            wordCount: audit.wordCount,
          };
        });

        setAuditedPages(audited);
      }
    } catch (error: any) {
      console.error(error);
      setError(error?.message || "Failed to fetch pages");
    }
  };

  // FETCH AI SUGGESTION
  const fetchSuggestion = async (page: any) => {
    try {
      setLoadingSuggestion(page.id);

      const title =
        page?.title?.rendered
          ? page.title.rendered
          : typeof page.title === "string"
            ? page.title
            : "";

      let content = "";

      if (page?.content?.rendered) {
        content = page.content.rendered;
      } else if (page?.excerpt?.rendered) {
        content = page.excerpt.rendered;
      } else if (title) {
        content = title;
      }

      if (!title || !content) {
        console.error("Missing data");
        setLoadingSuggestion(null);
        return;
      }

      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
      });

      const data = await res.json();

      if (data.success) {
        setSuggestions((prev: any) => ({
          ...prev,
          [page.id]: data.suggestion,
        }));
      }

      setLoadingSuggestion(null);
    } catch (err) {
      console.error(err);
      setLoadingSuggestion(null);
    }
  };
  // SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);
    setPages([]);
    setAuditedPages([]);
    setSuggestions({});

    try {
      const res = await fetch("/api/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, username, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setShowErrorPopup(true);
      } else {
        setResult(data);
        await fetchPages(url, username, password);
      }
    } catch (err) {
      setShowErrorPopup(true);
    }

    setLoading(false);
  };

  const handleInsert = async (page: any) => {
    if (!seoPlugin) return;

    const suggestion = suggestions[page.id];
    if (!suggestion) return;

    setUpdatingId(page.id);

    try {
      const res = await fetch("/api/update-seo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pageId: page.id,
          title: suggestion.title,
          meta: suggestion.meta,
          plugin: seoPlugin,
          url,
          username,
          password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setUpdatedPages((prev) => [...prev, page.id]);
      }
    } catch (err) {
      console.error(err);
    }

    setUpdatingId(null);
  };
  return (
    <div className={styles.page}>
      {/* ERROR POPUP */}
      {showErrorPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <h2>Login Details Incorrect ❌</h2>
            <p>
              Use <strong>Application Password</strong>, not normal password.
            </p>

            <div className={styles.popupSteps}>
              <ol>
                <li>Login to WordPress</li>
                <li>Go to Users → Profile</li>
                <li>Scroll to Application Passwords</li>
                <li>Create new password</li>
                <li>Paste here</li>
              </ol>
            </div>

            <button
              className={styles.closeButton}
              onClick={() => setShowErrorPopup(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.logo}>SEO Agent</div>
          <div className={styles.statusBadge}>
            <span className={styles.dot}></span>
            System Ready
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className={styles.main}>
        {/* HERO */}
        <section className={styles.hero}>
          <h1 className={styles.headline}>
            Automate Your <span>WordPress SEO</span> Optimization
          </h1>
          <p className={styles.subtext}>
            Connect your site, analyze SEO issues, and improve rankings with AI-powered insights
          </p>
        </section>

        {/* GRID */}
        <section className={styles.interactiveGrid}>

          {/* FORM (TOP) */}
          <div className={styles.formWide}>
            <h2 className={styles.cardTitle}>Connect Website</h2>

            <form onSubmit={handleSubmit}>

              {/* ROW 1 */}
              <div className={styles.rowFull}>
                <input
                  type="text"
                  placeholder="Website URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>

              {/* ROW 2 */}
              <div className={styles.rowTwo}>
                <input
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />

                <input
                  type="password"
                  placeholder="Application Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className={styles.checkboxGroup}>
                <input type="checkbox" id="terms" required />
                <label htmlFor="terms">
                  I accept the <a href="#">terms and conditions</a>
                </label>
              </div>
              {/* ROW 3 */}
              <button className={styles.analyzeButton} type="submit">
                {loading ? "Connecting..." : "Analyze My Website"}
              </button>
              {seoPlugin === null && (
                <div className={styles.warningBox}>
                  ⚠️ No SEO plugin detected. You can generate SEO, but inserting requires Yoast or RankMath.
                </div>
              )}

            </form>

            <div className={styles.trustText}>
              <div className={styles.trustItem}>✔ Uses official WordPress API</div>
              <div className={styles.trustItem}>✔ No changes made without approval</div>
              <div className={styles.trustItem}>✔ Credentials securely handled</div>
            </div>
          </div>


          {/* STATS + TABLE */} 
          <div className={styles.fullPanel}>

            {/* STATS */}
            <div className={styles.statsRow}>
              <div className={styles.statCard}>Score: {overallScore}</div>
              <div className={styles.statCard}>Pages: {totalPages}</div>
              <div className={styles.statCard}>Optimized: {optimizedPages}</div>
              <div className={styles.statCard}>Issues: {totalIssues}</div>
            </div>

            <div className={styles.resultsList}>

              {auditedPages.length === 0 && (
                <p style={{ padding: "20px", textAlign: "center" }}>
                  No pages analyzed yet
                </p>
              )}

              {auditedPages.map((page: any) => (
                <section key={page.id} className={styles.pageSection}>

                  <div className={styles.pageHeader}>
                    <div className={styles.pageInfo}>
                      <p className={styles.sectionLabel}>Current Data</p>

                      <h3 className={styles.currentTitle}>
                        {typeof page.title?.rendered === "string"
                          ? page.title.rendered
                          : "No title available"}
                      </h3>

                      <p className={styles.metaText}>
                        Meta Description: {typeof page.meta === "string"
                          ? page.meta
                          : "Not available"}
                      </p>
                    </div>

                    <div className={styles.pageStats}>
                      <div className={styles.statBox}>
                        <span className={styles.statBoxLabel}>Score</span>
                        <strong className={styles.statBoxValue}>{page.score}</strong>
                      </div>
                      <div className={styles.statBox}>
                        <span className={styles.statBoxLabel}>Issues</span>
                        <strong className={styles.statBoxValue}>{page.issues.length}</strong>
                      </div>
                    </div>
                  </div>

                  <div className={styles.actionRow}>
                    <button
                      className={styles.generateBtn}
                      onClick={() => fetchSuggestion(page)}
                    >
                      {loadingSuggestion === page.id ? "Generating..." : "Generate"}
                    </button>
                  </div>

                  {suggestions[page.id] && (
                    <div className={styles.generatedSection}>
                      <p className={styles.sectionLabel}>Generated Data</p>

                      <div className={styles.generatedBox}>
                        <p className={styles.generatedText}>
                          <strong>Optimized Title:</strong> {suggestions[page.id].title}
                        </p>
                        <p className={styles.generatedText}>
                          <strong>Meta Description:</strong> {suggestions[page.id].meta}
                        </p>
                      </div>

                      <button
                        className={styles.insertBtn}
                        disabled={!seoPlugin || updatingId === page.id}
                        onClick={() => handleInsert(page)}
                      >
                        {updatedPages.includes(page.id)
                          ? "Updated ✅"
                          : updatingId === page.id
                            ? "Updating..."
                            : "Insert Optimized SEO"}
                      </button>
                    </div>
                  )}

                </section>
              ))}
            </div>

          </div>

        </section>
      </main>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <span>© SEO Agent</span>
        </div>
      </footer>
    </div>
  );
}
