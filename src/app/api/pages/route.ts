import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url, username, password } = await req.json();

    if (!url || !username || !password) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const baseUrl = url.startsWith("http") ? url : `https://${url}`;

    const token = Buffer.from(`${username}:${password}`).toString("base64");

    const wpRes = await fetch(
      `${baseUrl}/wp-json/wp/v2/pages?per_page=100`,
      {
        headers: {
          Authorization: `Basic ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!wpRes.ok) {
      return NextResponse.json(
        {
          success: false,
          message: `WordPress API error: ${wpRes.status}`,
        },
        { status: wpRes.status }
      );
    }

    const data = await wpRes.json();

    if (!Array.isArray(data)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid response from WordPress",
        },
        { status: 500 }
      );
    }

    // ✅ PHASE 5 ADDITION — PLUGIN DETECTION
    let plugin: "yoast" | "rankmath" | null = null;

    try {
      const yoastCheck = await fetch(
        `${baseUrl}/wp-json/yoast/v1/get_head?url=${encodeURIComponent(baseUrl)}`,
        {
          headers: { Authorization: `Basic ${token}` },
        }
      );
      if (yoastCheck.ok) plugin = "yoast";
    } catch {}

    if (!plugin) {
      try {
        const rankCheck = await fetch(
          `${baseUrl}/wp-json/rankmath/v1/getHead?url=${encodeURIComponent(baseUrl)}`,
          {
            headers: { Authorization: `Basic ${token}` },
          }
        );
        if (rankCheck.ok) plugin = "rankmath";
      } catch {}
    }

    return NextResponse.json({
      success: true,
      pages: data,
      plugin, // ✅ NEW
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch pages",
      },
      { status: 500 }
    );
  }
}