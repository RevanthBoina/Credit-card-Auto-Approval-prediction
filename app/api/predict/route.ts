import { NextRequest, NextResponse } from 'next/server'

/**
 * Server-side proxy to the Flask prediction API.
 *
 * The browser never talks to Flask directly — it calls this route
 * (same-origin, no CORS needed), and this route forwards the request
 * to FLASK_API_URL server-to-server.
 *
 * Set FLASK_API_URL in .env.local, e.g.:
 *   FLASK_API_URL=http://127.0.0.1:8080
 */
const FLASK_API_URL = process.env.FLASK_API_URL ?? 'http://127.0.0.1:8080'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Request body must be valid JSON.' },
      { status: 400 },
    )
  }

  try {
    const backendResponse = await fetch(`${FLASK_API_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      // Predictions are user-specific and must never be cached.
      cache: 'no-store',
    })

    const data = await backendResponse.json().catch(() => null)

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Backend returned an invalid response.' },
        { status: 502 },
      )
    }

    return NextResponse.json(data, { status: backendResponse.status })
  } catch (error) {
    console.error('Failed to reach prediction backend:', error)
    return NextResponse.json(
      { success: false, error: 'Could not reach the prediction backend.' },
      { status: 502 },
    )
  }
}
