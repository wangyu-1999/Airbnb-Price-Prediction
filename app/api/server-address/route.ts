import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({ serverAddress: process.env.SERVER_ADDRESS })
}
