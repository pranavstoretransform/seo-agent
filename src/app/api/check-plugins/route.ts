import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { wpUrl, username, password } = body;

    if (!wpUrl || !username || !password) {
      return NextResponse.json(
        { success: false, message: "Missing credentials" },
        { status: 400 }
      );
    }

    const auth = Buffer.from(`${username}:${password}`).toString("base64");

    const headers = {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    };

    let hasYoast = false;
    let hasRankMath = false;
    let hasSeoBridge = false;

    // 🔹 Check plugins
    const pluginRes = await fetch(`${wpUrl}/wp-json/wp/v2/plugins`, {
      headers,
    });

    if (pluginRes.ok) {
      const plugins = await pluginRes.json();

      console.log("PLUGINS RESPONSE:", plugins);

      if (Array.isArray(plugins)) {
        hasYoast = plugins.some((p: any) =>
          p.plugin?.includes("wordpress-seo/wp-seo.php")
        );

        hasRankMath = plugins.some((p: any) =>
          p.plugin?.includes("seo-by-rank-math/rank-math.php")
        );
      }
    }

    // 🔹 Check SEO Bridge plugin
    try {
      const statusRes = await fetch(
        `${wpUrl}/wp-json/seo-agent/v1/status`
      );

      if (statusRes.ok) {
        hasSeoBridge = true;
      }
    } catch (err) {
      hasSeoBridge = false;
    }

    return NextResponse.json({
      success: true,
      hasYoast,
      hasRankMath,
      hasSeoBridge,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}