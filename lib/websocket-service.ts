"use client"

export class WebSocketService {
  private subscriptions = new Map<string, Set<(data: any) => void>>()
  private pollingIntervals = new Map<string, NodeJS.Timeout>()

  constructor() {
    // Use polling instead of WebSocket for better Next.js compatibility
  }

  async subscribeToAddress(address: string, callback: (data: any) => void): Promise<string | null> {
    try {
      const subscriptionId = `${address}-${Date.now()}`

      if (!this.subscriptions.has(subscriptionId)) {
        this.subscriptions.set(subscriptionId, new Set())
      }

      this.subscriptions.get(subscriptionId)!.add(callback)

      // Start polling for this address
      this.startPolling(address, subscriptionId)

      return subscriptionId
    } catch (error) {
      console.error("Subscription error:", error)
      return null
    }
  }

  private startPolling(address: string, subscriptionId: string) {
    // Poll every 30 seconds for new activity
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/alchemy/activity/${address}`)
        if (response.ok) {
          const data = await response.json()
          const callbacks = this.subscriptions.get(subscriptionId)

          if (callbacks) {
            callbacks.forEach((callback) => callback(data))
          }
        }
      } catch (error) {
        console.error("Polling error:", error)
      }
    }, 30000)

    this.pollingIntervals.set(subscriptionId, interval)
  }

  unsubscribe(subscriptionId: string, callback?: (data: any) => void) {
    const callbacks = this.subscriptions.get(subscriptionId)

    if (callbacks) {
      if (callback) {
        callbacks.delete(callback)
      } else {
        callbacks.clear()
      }

      if (callbacks.size === 0) {
        this.subscriptions.delete(subscriptionId)

        // Clear polling interval
        const interval = this.pollingIntervals.get(subscriptionId)
        if (interval) {
          clearInterval(interval)
          this.pollingIntervals.delete(subscriptionId)
        }
      }
    }
  }

  disconnect() {
    // Clear all intervals
    for (const interval of this.pollingIntervals.values()) {
      clearInterval(interval)
    }

    this.subscriptions.clear()
    this.pollingIntervals.clear()
  }
}

// Singleton instance
export const webSocketService = new WebSocketService()
