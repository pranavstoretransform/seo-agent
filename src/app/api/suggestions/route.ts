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
    // 🔥 PROMPT
    // =========================
    const prompt = `
You are an expert SEO specialist.

Given the following page data:

Title:
${title}

Content:
${cleanContent}

Your task:
1. Generate an SEO-optimized title (50–60 characters)
2. Generate a meta description (120–160 characters)

Rules:
- Make it engaging and keyword-rich
- Do NOT repeat the same title
- Keep it natural and human-readable
- DO NOT include explanations
- RETURN ONLY JSON

Format strictly:

{
  "title": "new title here",
  "meta": "meta description here"
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
    // 🔥 SAFE JSON PARSING
    // =========================
    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.error("❌ JSON PARSE FAILED");

      // 🔥 TRY TO EXTRACT JSON FROM TEXT (VERY IMPORTANT)
      const match = text.match(/\{[\s\S]*\}/);

      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch (innerErr) {
          return NextResponse.json(
            {
              success: false,
              message: "AI returned invalid JSON",
              raw: text,
            },
            { status: 500 }
          );
        }
      } else {
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
    // 🔥 VALIDATE RESPONSE STRUCTURE
    // =========================
    if (!parsed.title || !parsed.meta) {
      return NextResponse.json(
        {
          success: false,
          message: "Incomplete AI response",
          raw: parsed,
        },
        { status: 500 }
      );
    }

    // =========================
    // ✅ SUCCESS RESPONSE
    // =========================
    return NextResponse.json({
      success: true,
      suggestion: parsed,
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