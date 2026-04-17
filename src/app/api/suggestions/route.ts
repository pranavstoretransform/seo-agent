// src/app/api/suggestions/route.ts

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { title, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { success: false, message: "Missing title or content" },
        { status: 400 }
      );
    }

    // =========================
    // 🔥 CLEAN CONTENT (LIMIT SIZE)
    // =========================
    const cleanContent = content
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 1500);

    // =========================
    // 🔥 PROMPT (STRICT JSON MODE)
    // =========================
    const prompt = `
You are a professional SEO expert.

Analyze the following page:

Title:
${title}

Content:
${cleanContent}

You are a professional SEO expert specializing in on-page optimization.

Analyze the following page:

TITLE:
${title}

CONTENT:
${cleanContent}

YOUR TASK:

1. Identify the main topic and primary keyword of the page.
2. Generate an SEO-optimized title.
3. Generate a meta description.

REQUIREMENTS:

TITLE:
- Length: 50–60 characters
- Must include the primary keyword naturally
- Should be compelling and click-worthy (high CTR)
- Avoid generic phrases
- Do NOT repeat the original title

META DESCRIPTION:
- Length: 120–160 characters
- Clearly explain what the page offers
- Include the primary keyword naturally
- Add a subtle call-to-action (e.g., Learn, Discover, Get)
- Must be human-readable and engaging

RULES:
- Do NOT include explanations
- Do NOT include markdown or backticks
- Do NOT include labels like "Title:" or "Meta:"
- Return ONLY valid JSON

STRICT FORMAT:

{
  "title": "optimized title here",
  "meta": "optimized meta description here"
}
`;

    // =========================
    // 🔥 CALL OPENROUTER
    // =========================
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openrouter/auto",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3, // 🔥 reduce randomness
        }),
      }
    );

    const data = await response.json();

    console.log("🧠 RAW AI RESPONSE:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "AI request failed",
          error: data,
        },
        { status: 500 }
      );
    }

    const text = data?.choices?.[0]?.message?.content || "";

    console.log("🧠 AI TEXT OUTPUT:", text);

    // =========================
    // 🔥 STEP 1: REMOVE BACKTICKS
    // =========================
    let cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // =========================
    // 🔥 STEP 2: TRY DIRECT PARSE
    // =========================
    let parsed;

    try {
      parsed = JSON.parse(cleanedText);
    } catch (err) {
      console.warn("⚠️ Direct JSON parse failed. Trying extraction...");

      // =========================
      // 🔥 STEP 3: EXTRACT JSON BLOCK
      // =========================
      const match = cleanedText.match(/\{[\s\S]*\}/);

      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch (innerErr) {
          console.error("❌ JSON EXTRACTION PARSE FAILED");

          return NextResponse.json(
            {
              success: false,
              message: "AI returned malformed JSON",
              raw: text,
            },
            { status: 500 }
          );
        }
      } else {
        console.error("❌ NO JSON FOUND IN RESPONSE");

        return NextResponse.json(
          {
            success: false,
            message: "No JSON found in AI response",
            raw: text,
          },
          { status: 500 }
        );
      }
    }

    // =========================
    // 🔥 STEP 4: VALIDATE STRUCTURE
    // =========================
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.title !== "string" ||
      typeof parsed.meta !== "string"
    ) {
      console.error("❌ INVALID AI STRUCTURE:", parsed);

      return NextResponse.json(
        {
          success: false,
          message: "Invalid AI response structure",
          raw: parsed,
        },
        { status: 500 }
      );
    }

    // =========================
    // ✅ FINAL CLEAN OUTPUT
    // =========================
    const finalResult = {
      title: parsed.title.trim(),
      meta: parsed.meta.trim(),
    };

    // =========================
    // ✅ SUCCESS RESPONSE
    // =========================
    return NextResponse.json({
      success: true,
      suggestion: finalResult,
    });

  } catch (error: any) {
    console.error("🔥 Suggestions API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Server error",
      },
      { status: 500 }
    );
  }
}