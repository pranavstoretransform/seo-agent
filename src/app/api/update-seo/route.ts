// src/app/api/update-seo/route.ts

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const {
      pageId,
      title,
      meta,
      plugin,
      url,
      username,
      password,
    } = await req.json();

    // VALIDATION
    if (!pageId || !title || !meta || !plugin || !url || !username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    if (plugin !== "yoast" && plugin !== "rankmath") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid plugin type",
        },
        { status: 400 }
      );
    }

    // BASE URL FIX
    const baseUrl = url.startsWith("http") ? url : `https://${url}`;

    // AUTH TOKEN
    const token = Buffer.from(`${username}:${password}`).toString("base64");

    // PREPARE META PAYLOAD

    let metaPayload: any = {};

    if (plugin === "yoast") {
      metaPayload = {
        _yoast_wpseo_title: title,
        _yoast_wpseo_metadesc: meta,
      };
    }

    if (plugin === "rankmath") {
      metaPayload = {
        rank_math_title: title,
        rank_math_description: meta,
      };
    }

    // UPDATE WORDPRESS PAGE
    const wpResponse = await fetch(
      `${baseUrl}/wp-json/wp/v2/pages/${pageId}`,
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

    const wpData = await wpResponse.json();

    // HANDLE FAILURE
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
        pageId,
        plugin,
        title,
        meta,
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