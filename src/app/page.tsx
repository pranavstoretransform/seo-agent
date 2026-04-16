"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [url, setUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [pages, setPages] = useState<any[]>([]);

  // 🔥 NEW FUNCTION (FETCH PAGES)
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
        console.log("Pages fetched:", data.pages);
      } else {
        console.error("Failed to fetch pages");
      }
    } catch (error) {
      console.error("Error fetching pages", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);
    setPages([]); // reset pages on new submit

    try {
      const res = await fetch("/api/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          username,
          password,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Connection failed");
      } else {
        setResult(data);

        // 🔥 IMPORTANT: CALL FETCH PAGES AFTER SUCCESS
        await fetchPages(url, username, password);
      }
    } catch (err) {
      setError("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className={styles.page}>
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
            Connect your site, analyze SEO issues, and improve rankings with
            AI-powered insights
          </p>
        </section>

        {/* GRID */}
        <section className={styles.interactiveGrid}>
          {/* FORM */}
          <div className={styles.formCard}>
            <h2 className={styles.cardTitle}>Connect Your Website</h2>

            <form onSubmit={handleSubmit}>
              {/* URL */}
              <div className={styles.formGroup}>
                <label>Website URL</label>
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>

              {/* USERNAME */}
              <div className={styles.formGroup}>
                <label>WordPress Username</label>
                <input
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              {/* PASSWORD */}
              <div className={styles.formGroup}>
                <label>Application Password</label>
                <input
                  type="password"
                  placeholder="xxxx xxxx xxxx"
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

              <button className={styles.analyzeButton} type="submit">
                {loading ? "Connecting..." : "Analyze My Website"}
              </button>
            </form>

            {/* RESULT */}
            {result && (
              <p style={{ color: "green", marginTop: "10px" }}>
                ✅ Connected Successfully
              </p>
            )}

            {error && (
              <p style={{ color: "red", marginTop: "10px" }}>{error}</p>
            )}

            {/* TRUST TEXT */}
            <div className={styles.trustText}>
              <div className={styles.trustItem}>
                ✔ Uses official WordPress API
              </div>
              <div className={styles.trustItem}>
                ✔ No changes made without approval
              </div>
              <div className={styles.trustItem}>
                ✔ Credentials securely handled
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className={styles.dashboardPreview}>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>SEO Score</span>
                <div className={styles.statValue}>
                  <span className={styles.oldValue}>62</span>
                  →
                  <span className={styles.newValue}>85</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <span className={styles.statLabel}>Pages Optimized</span>
                <div className={styles.statValue}>14</div>
              </div>

              <div className={styles.statCard}>
                <span className={styles.statLabel}>Missing Meta</span>
                <div className={styles.statValue}>
                  <span className={styles.oldValue}>23</span>
                  →
                  <span className={styles.newValue}>2</span>
                </div>
              </div>
            </div>

            <div className={styles.tablePreview}>
              <div className={styles.tableHeader}>
                <span>Page</span>
                <span>Status</span>
              </div>

              {pages.length > 0 ? (
                pages.map((page: any) => (
                  <div className={styles.tableRow} key={page.id}>
                    <span className={styles.path}>{page.slug}</span>
                    <span className={styles.good}>Fetched</span>
                  </div>
                ))
              ) : (
                <p style={{ padding: "10px" }}>No pages yet</p>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <span>© 2026 SEO Agent</span>
          <div className={styles.footerLinks}>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}