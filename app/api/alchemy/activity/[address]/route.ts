import { type NextRequest, NextResponse } from "next/server"
import { activityService } from "@/lib/alchemy" // Assuming activityService is part of alchemy.ts or a separate file

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  const { address } = params

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 })
  }

  try {
    // In a real application, you'd call Alchemy SDK here
    // For now, we'll use a mock from lib/alchemy.ts
    const activity = await activityService.getActivity(address)
    return NextResponse.json(activity)
  } catch (error) {
    console.error("Error fetching activity:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
