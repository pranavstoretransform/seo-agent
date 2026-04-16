import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url, username, password } = await req.json();

    const wpRes = await fetch(`${url}/wp-json/wp/v2/users/me`, {
      headers: {
        Authorization:
          "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
      },
    });

    if (!wpRes.ok) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const user = await wpRes.json();

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}