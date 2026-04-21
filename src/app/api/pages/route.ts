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

    const postsRes = await fetch(
      `${baseUrl}/wp-json/wp/v2/posts?per_page=100`,
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

    let posts: any[] = [];

    if (postsRes.ok) {
      const postData = await postsRes.json();
      if (Array.isArray(postData)) {
        posts = postData;
      }
    }

    if (!Array.isArray(data)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid response from WordPress",
        },
        { status: 500 }
      );
    }

    

    return NextResponse.json({
      success: true,
      pages: data,
      posts,
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