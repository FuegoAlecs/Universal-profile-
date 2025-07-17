import { type NextRequest, NextResponse } from "next/server"
import { getAlchemyActivity } from "@/lib/alchemy"

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  const { address } = params

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 })
  }

  try {
    const activity = await getAlchemyActivity(address)
    return NextResponse.json({ activity })
  } catch (error) {
    console.error("Error in Alchemy activity API:", error)
    return NextResponse.json({ error: "Failed to fetch activity data" }, { status: 500 })
  }
}
