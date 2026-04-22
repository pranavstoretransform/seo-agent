// src/app/api/update-seo/route.ts

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      post_id,
      title,
      description,
      url,
      username,
      password,
    } = body;

    // VALIDATION
    if (
      post_id === undefined ||
      post_id === null ||
      !title ||
      !description ||
      !url ||
      !username ||
      !password
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
          received: {
            post_id,
            title,
            description,
            url,
            username,
            passwordExists: !!password,
          },
        },
        { status: 400 }
      );
    }

    // BASE URL FIX
    const baseUrl = url.startsWith("http") ? url : `https://${url}`;

    // AUTH TOKEN
    const token = Buffer.from(`${username}:${password}`).toString("base64");

    // YOAST META PAYLOAD (STANDARDIZED)
    const metaPayload = {
      _yoast_wpseo_title: title,
      _yoast_wpseo_metadesc: description,
    };

    // TRY UPDATE AS PAGE FIRST
    let wpResponse = await fetch(
      `${baseUrl}/wp-json/wp/v2/pages/${post_id}`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meta: metaPayload,
        }),
      }
    );

    let wpData = await wpResponse.json();

    // IF PAGE UPDATE FAILS, TRY AS POST
    if (!wpResponse.ok) {
      wpResponse = await fetch(
        `${baseUrl}/wp-json/wp/v2/posts/${post_id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            meta: metaPayload,
          }),
        }
      );

      wpData = await wpResponse.json();
    }

    // FINAL FAILURE
    if (!wpResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update SEO",
          error: wpData,
        },
        { status: 500 }
      );
    }

    // SUCCESS RESPONSE
    return NextResponse.json({
      success: true,
      message: "SEO updated successfully",
      updated: {
        post_id,
        title,
        description,
      },
    });

  } catch (error: any) {
    console.error("UPDATE SEO ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Server error",
      },
      { status: 500 }
    );
  }
}