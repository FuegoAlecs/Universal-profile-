import { type NextRequest, NextResponse } from "next/server"
import { tokenService } from "@/lib/alchemy"

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  const { address } = params

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 })
  }

  try {
    const balances = await tokenService.getTokenBalances(address)
    return NextResponse.json(balances)
  } catch (error) {
    console.error("Error fetching token balances:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
