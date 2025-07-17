import { type NextRequest, NextResponse } from "next/server"
import { getAlchemyProfile } from "@/lib/alchemy"

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  const { address } = params

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 })
  }

  try {
    const profile = await getAlchemyProfile(address)
    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Error in Alchemy profile API:", error)
    return NextResponse.json({ error: "Failed to fetch profile data" }, { status: 500 })
  }
}
