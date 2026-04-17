// src/lib/seoAudit.ts

export function auditPage(page: any) {
  let score = 0;
  const issues: string[] = [];

  // =========================
  // 🔥 WEIGHTS (REALISTIC)
  // =========================
  const WEIGHTS = {
    title: 30,
    content: 30,
    slug: 15,
    keyword: 15,
    headings: 10,
  };

  // =========================
  // 🔥 EXTRACT DATA
  // =========================
  const rawTitle = page.title?.rendered || "";
  const contentHTML = page.content?.rendered || "";
  const slug = page.slug || "";

  // Remove HTML from title as well
  const title = rawTitle.replace(/<[^>]*>/g, "").trim();

  // Clean content HTML → plain text
  const cleanText = contentHTML.replace(/<[^>]*>/g, "").trim();

  // Word count
  const wordCount = cleanText ? cleanText.split(/\s+/).length : 0;

  // =========================
  // 🔥 KEYWORD EXTRACTION (VERY BASIC)
  // =========================
  let keyword = "";
  if (title) {
    keyword = title.split(" ")[0].toLowerCase();
  }

  // =========================
  // ✅ TITLE SCORING (GRADED)
  // =========================
  if (!title) {
    issues.push("Missing title");
  } else {
    const len = title.length;

    if (len < 30) {
      issues.push("Title extremely short (<30 chars)");
      score += 5;
    } else if (len < 50) {
      issues.push("Title slightly short (30–50 chars)");
      score += 15;
    } else if (len <= 60) {
      score += WEIGHTS.title;
    } else if (len <= 70) {
      issues.push("Title slightly long (60–70 chars)");
      score += 20;
    } else {
      issues.push("Title too long (>70 chars)");
      score += 5;
    }
  }

  // =========================
  // ✅ CONTENT SCORING (GRADED)
  // =========================
  if (!cleanText) {
    issues.push("No content found");
  } else {
    if (wordCount < 100) {
      issues.push("Very thin content (<100 words)");
      score += 5;
    } else if (wordCount < 300) {
      issues.push("Content too short (100–300 words)");
      score += 15;
    } else if (wordCount < 800) {
      score += 25;
    } else {
      score += WEIGHTS.content;
    }
  }

  // =========================
  // ✅ SLUG SCORING (GRADED)
  // =========================
  if (!slug) {
    issues.push("Missing URL slug");
  } else {
    if (slug.length < 5) {
      issues.push("Slug too short");
      score += 5;
    } else if (!slug.includes("-")) {
      issues.push("Slug should contain hyphens (SEO-friendly)");
      score += 8;
    } else if (slug.length > 60) {
      issues.push("Slug too long");
      score += 8;
    } else {
      score += WEIGHTS.slug;
    }
  }

  // =========================
  // ✅ KEYWORD CHECK (NEW)
  // =========================
  if (keyword) {
    const lowerContent = cleanText.toLowerCase();
    const lowerTitle = title.toLowerCase();

    if (!lowerContent.includes(keyword)) {
      issues.push("Keyword not found in content");
      score += 5;
    } else if (!lowerTitle.includes(keyword)) {
      issues.push("Keyword missing in title");
      score += 10;
    } else {
      score += WEIGHTS.keyword;
    }
  }

  // =========================
  // ✅ HEADING CHECK (NEW)
  // =========================
  const hasH1 = contentHTML.includes("<h1");
  const hasH2 = contentHTML.includes("<h2");

  if (!hasH1 && !hasH2) {
    issues.push("No headings found (H1/H2)");
  } else if (hasH1 && hasH2) {
    score += WEIGHTS.headings;
  } else {
    issues.push("Weak heading structure (missing H1 or H2)");
    score += 5;
  }

  // =========================
  // ⚠️ META (STILL NOT IMPLEMENTED)
  // =========================
  issues.push("Meta description not analyzed (Yoast not integrated)");

  // =========================
  // 🔥 FINAL SCORE NORMALIZATION
  // =========================
  if (score > 100) score = 100;

  // Prevent negative logic issues
  if (score < 0) score = 0;

  return {
    score,
    issues,
    wordCount,
    keyword,
  };
}