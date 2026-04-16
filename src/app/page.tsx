import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.logo}>SEO Agent</div>
          <div className={styles.statusBadge}>
            <span className={styles.dot}></span>
            System Ready
          </div>
        </div>
      </nav>

      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <h1 className={styles.headline}>
            Automate Your WordPress <br />
            <span>SEO Optimization</span>
          </h1>
          <p className={styles.subtext}>
            Connect your site, analyze SEO issues, and improve rankings with AI-powered insights.
          </p>
        </section>

        {/* Interactive Section */}
        <section className={styles.interactiveGrid}>
          {/* Main Form Card */}
          <div className={styles.formCard}>
            <h2 className={styles.cardTitle}>Connect Website</h2>
            <div className={styles.formGroup}>
              <label htmlFor="url">Website URL</label>
              <input type="text" id="url" placeholder="https://your-site.com" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="username">WordPress Username</label>
              <input type="text" id="username" placeholder="admin" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="password">Application Password</label>
              <input type="password" id="password" placeholder="•••• •••• •••• ••••" />
            </div>
            <button className={styles.analyzeButton}>Analyze My Website</button>
            
            <div className={styles.trustText}>
              <div className={styles.trustItem}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                Uses official WordPress API
              </div>
              <div className={styles.trustItem}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                No changes made without your approval
              </div>
              <div className={styles.trustItem}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                Credentials are securely handled
              </div>
            </div>
          </div>

          {/* Right Side Panel - Dashboard Preview */}
          <div className={styles.dashboardPreview}>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>SEO Score</span>
                <div className={styles.statValue}>
                  <span className={styles.oldValue}>62</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  <span className={styles.newValue}>2</span>
                </div>
              </div>
            </div>

            <div className={styles.tablePreview}>
              <div className={styles.tableHeader}>
                <span>Page Path</span>
                <span>Before</span>
                <span>After (AI)</span>
              </div>
              <div className={styles.tableRow}>
                <span className={styles.path}>/blog/ai-trends</span>
                <span className={styles.bad}>Missing Title</span>
                <span className={styles.good}>Optimized Title</span>
              </div>
              <div className={styles.tableRow}>
                <span className={styles.path}>/services</span>
                <span className={styles.bad}>Short Desc</span>
                <span className={styles.good}>Rich Meta Desc</span>
              </div>
              <div className={styles.tableRow}>
                <span className={styles.path}>/contact</span>
                <span className={styles.bad}>No Alt Text</span>
                <span className={styles.good}>Smart Alt Text</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.features}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔍</div>
            <h3>Find Critical SEO Issues in Seconds</h3>
            <p>Our agent crawls your WordPress site to identify technical and content gaps immediately.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>✍️</div>
            <h3>Generate Optimized Titles & Descriptions</h3>
            <p>Leverage GPT-4 to create compelling, keyword-rich metadata that drives clicks.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📈</div>
            <h3>Track Measurable SEO Improvements</h3>
            <p>Watch your rankings climb with detailed performance reports and historical tracking.</p>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <span>© 2026 SEO Agent. Built for WordPress.</span>
          <div className={styles.footerLinks}>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
