import { NextResponse } from "next/server";

// In-memory cache to save quota: placeName -> photos[]
const photoCache: Record<string, { photos: any[]; rating?: number; userRatingCount?: number; timestamp: number }> = {};

export async function POST(req: Request) {
  try {
    const { name, province, lat, lng } = await req.json();
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ success: false, error: "Missing GOOGLE_PLACES_API_KEY" }, { status: 400 });
    }

    const cleanName = (name || "")
      .replace(/\(.*?\)/g, "")
      .replace(/\[.*?\]/g, "")
      .trim();

    const cacheKey = `${cleanName}_${province || ""}`;
    if (photoCache[cacheKey] && Date.now() - photoCache[cacheKey].timestamp < 1000 * 60 * 60 * 24) {
      return NextResponse.json({
        success: true,
        cached: true,
        photos: photoCache[cacheKey].photos,
        rating: photoCache[cacheKey].rating,
        userRatingCount: photoCache[cacheKey].userRatingCount,
      });
    }

    // 1. Text Search for Place ID & Photos metadata
    const searchUrl = "https://places.googleapis.com/v1/places:searchText";
    const bodyPayload: any = {
      textQuery: `${cleanName} ${province || ""}`.trim(),
      languageCode: "th",
    };
    if (lat && lng) {
      bodyPayload.locationBias = {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: 10000.0,
        },
      };
    }

    const searchRes = await fetch(searchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,places.displayName,places.photos,places.rating,places.userRatingCount,places.googleMapsUri",
      },
      body: JSON.stringify(bodyPayload),
    });

    const searchData = await searchRes.json();
    const place = searchData.places?.[0];

    if (!place || !place.photos || place.photos.length === 0) {
      return NextResponse.json({
        success: true,
        photos: [],
        rating: place?.rating || null,
        userRatingCount: place?.userRatingCount || 0,
      });
    }

    // 2. Fetch direct photoUri for the top 8 user photos
    const topPhotos = place.photos.slice(0, 8);
    const photoPromises = topPhotos.map(async (p: any) => {
      try {
        const mediaUrl = `https://places.googleapis.com/v1/${p.name}/media?maxWidthPx=800&maxHeightPx=600&skipHttpRedirect=true&key=${apiKey}`;
        const mediaRes = await fetch(mediaUrl);
        const mediaJson = await mediaRes.json();
        const author = p.authorAttributions?.[0];
        return {
          photoUri: mediaJson.photoUri,
          authorName: author?.displayName || "ผู้รีวิวบน Google Maps",
          authorUri: author?.uri || null,
          googleMapsUri: p.googleMapsUri || place.googleMapsUri || null,
        };
      } catch {
        return null;
      }
    });

    const resolvedPhotos = (await Promise.all(photoPromises)).filter((p) => p && p.photoUri);

    photoCache[cacheKey] = {
      photos: resolvedPhotos,
      rating: place.rating,
      userRatingCount: place.userRatingCount,
      timestamp: Date.now(),
    };

    return NextResponse.json({
      success: true,
      placeId: place.id,
      displayName: place.displayName?.text || cleanName,
      rating: place.rating || null,
      userRatingCount: place.userRatingCount || 0,
      googleMapsUri: place.googleMapsUri || null,
      photos: resolvedPhotos,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
