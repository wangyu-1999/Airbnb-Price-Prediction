import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({ apiKey: process.env.GOOGLE_MAPS_API_KEY, mapId: process.env.MAP_ID })
}