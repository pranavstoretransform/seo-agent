import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url, username, password } = await req.json();

    const baseUrl = url.startsWith("http") ? url : `https://${url}`;

    const token = Buffer.from(`${username}:${password}`).toString("base64");

    const res = await fetch(`${baseUrl}/wp-json/wp/v2/pages`, {
      headers: {
        Authorization: `Basic ${token}`,
      },
    });

    const data = await res.json();

    return NextResponse.json({
      success: true,
      pages: data,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to fetch pages",
    });
  }
}