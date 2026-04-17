// src/lib/seoAudit.ts

export function auditPage(page: any) {
  let score = 0;
  const issues: string[] = [];

  // 🔥 Extract fields
  const title = page.title?.rendered || "";
  const contentHTML = page.content?.rendered || "";
  const slug = page.slug || "";

  // 🔥 Clean HTML → text
  const cleanText = contentHTML.replace(/<[^>]*>/g, "").trim();

  // 🔥 WORD COUNT
  const wordCount = cleanText ? cleanText.split(/\s+/).length : 0;

  // =========================
  // ✅ TITLE CHECK
  // =========================
  if (!title) {
    issues.push("Missing title");
  } else {
    if (title.length < 50) {
      issues.push("Title too short (<50 characters)");
    } else if (title.length > 60) {
      issues.push("Title too long (>60 characters)");
    } else {
      score += 25;
    }
  }

  // =========================
  // ✅ CONTENT CHECK
  // =========================
  if (!cleanText) {
    issues.push("No content found");
  } else if (wordCount < 300) {
    issues.push("Content too short (<300 words)");
  } else {
    score += 25;
  }

  // =========================
  // ✅ SLUG CHECK
  // =========================
  if (!slug) {
    issues.push("Missing URL slug");
  } else if (!slug.includes("-")) {
    issues.push("Slug should contain hyphens (SEO-friendly)");
  } else {
    score += 25;
  }

  // =========================
  // ⚠️ META CHECK (TEMPORARY)
  // =========================
  issues.push("Meta description not detected (Yoast not integrated)");
  // (No score added yet)

  // =========================
  // FINAL SCORE NORMALIZATION
  // =========================
  if (score > 100) score = 100;

  return {
    score,
    issues,
    wordCount,
  };
}