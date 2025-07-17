// Simplified Alchemy configuration for Next.js compatibility
export const ALCHEMY_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || process.env.ALCHEMY_API_KEY,
  networks: {
    ethereum: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || process.env.ALCHEMY_API_KEY}`,
      chainId: 1,
      name: "Ethereum",
    },
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || process.env.ALCHEMY_API_KEY}`,
      chainId: 137,
      name: "Polygon",
    },
    arbitrum: {
      url: `https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || process.env.ALCHEMY_API_KEY}`,
      chainId: 42161,
      name: "Arbitrum",
    },
    optimism: {
      url: `https://opt-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || process.env.ALCHEMY_API_KEY}`,
      chainId: 10,
      name: "Optimism",
    },
  },
} as const

export type SupportedChain = keyof typeof ALCHEMY_CONFIG.networks

// Helper function to make Alchemy API calls
export async function alchemyRequest(network: SupportedChain, method: string, params: any[] = []) {
  const config = ALCHEMY_CONFIG.networks[network]

  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    }),
  })

  if (!response.ok) {
    throw new Error(`Alchemy request failed: ${response.statusText}`)
  }

  const data = await response.json()

  if (data.error) {
    throw new Error(`Alchemy error: ${data.error.message}`)
  }

  return data.result
}
