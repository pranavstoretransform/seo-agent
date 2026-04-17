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

  // 🔥 AI STATES
  const [suggestions, setSuggestions] = useState<any>({});
  const [loadingSuggestion, setLoadingSuggestion] = useState<number | null>(null);

  // =========================
  // 📊 STATS
  // =========================
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

  // =========================
  // 📡 FETCH PAGES
  // =========================
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
    } catch (error) {
      console.error(error);
    }
  };

  // =========================
  // 🤖 FETCH AI SUGGESTION
  // =========================
  const fetchSuggestion = async (page: any) => {
    try {
      setLoadingSuggestion(page.id);

      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: page.title?.rendered || "",
          content: page.content?.rendered || "",
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuggestions((prev: any) => ({
          ...prev,
          [page.id]: data.suggestion,
        }));
      } else {
        console.error("Suggestion failed", data);
      }
    } catch (err) {
      console.error("Suggestion error", err);
    }

    setLoadingSuggestion(null);
  };

  // =========================
  // 🚀 SUBMIT
  // =========================
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

  return (
    <div className={styles.page}>
      {/* ========================= */}
      {/* ERROR POPUP */}
      {/* ========================= */}
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

      {/* ========================= */}
      {/* NAVBAR */}
      {/* ========================= */}
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.logo}>SEO Agent</div>
          <div className={styles.statusBadge}>
            <span className={styles.dot}></span>
            System Ready
          </div>
        </div>
      </nav>

      {/* ========================= */}
      {/* MAIN */}
      {/* ========================= */}
      <main className={styles.main}>
        {/* HERO */}
        <section className={styles.hero}>
          <h1 className={styles.headline}>
            Automate Your <span>WordPress SEO</span>
          </h1>
          <p className={styles.subtext}>
            Analyze and improve SEO with AI
          </p>
        </section>

        {/* GRID */}
        <section className={styles.interactiveGrid}>
          {/* FORM */}
          <div className={styles.formCard}>
            <h2 className={styles.cardTitle}>Connect Website</h2>

            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Website URL</label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Application Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className={styles.analyzeButton}>
                {loading ? "Connecting..." : "Analyze"}
              </button>
            </form>

            {result && <p style={{ color: "green" }}>Connected</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            <div className={styles.trustText}>
              <div className={styles.trustItem}>✔ Official API</div>
              <div className={styles.trustItem}>✔ Secure</div>
              <div className={styles.trustItem}>✔ No changes auto</div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className={styles.dashboardPreview}>
            {/* STATS */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>Score: {overallScore}</div>
              <div className={styles.statCard}>Pages: {totalPages}</div>
              <div className={styles.statCard}>
                Optimized: {optimizedPages}
              </div>
              <div className={styles.statCard}>Issues: {totalIssues}</div>
            </div>

            {/* TABLE */}
            <div className={styles.tablePreview}>
              <div className={styles.tableHeader}>
                <span>Page</span>
                <span>Score</span>
                <span>Issues</span>
                <span>Action</span>
              </div>

              {auditedPages.length > 0 ? (
                auditedPages.map((page: any) => (
                  <div key={page.id} className={styles.tableRow}>
                    <span>{page.slug}</span>
                    <span>{page.score}</span>
                    <span>{page.issues.length}</span>

                    <span>
                      <button
                        onClick={() => fetchSuggestion(page)}
                        disabled={loadingSuggestion === page.id}
                      >
                        {loadingSuggestion === page.id
                          ? "Generating..."
                          : "Generate"}
                      </button>
                    </span>

                    {/* AI OUTPUT */}
                    {suggestions[page.id] && (
                      <div style={{ marginTop: "10px" }}>
                        <p>
                          <strong>Title:</strong>{" "}
                          {suggestions[page.id].title}
                        </p>
                        <p>
                          <strong>Meta:</strong>{" "}
                          {suggestions[page.id].meta}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p>No pages yet</p>
              )}
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