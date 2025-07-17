import { type NextRequest, NextResponse } from "next/server"
import { getAlchemyTokenBalances } from "@/lib/alchemy"

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  const { address } = params

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 })
  }

  try {
    const balances = await getAlchemyTokenBalances(address)
    return NextResponse.json({ balances })
  } catch (error) {
    console.error("Error in Alchemy balances API:", error)
    return NextResponse.json({ error: "Failed to fetch token balances" }, { status: 500 })
  }
}
