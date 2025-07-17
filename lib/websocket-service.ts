"use client"

export class WebSocketService {
  private subscriptions = new Map<string, Set<(data: any) => void>>()
  private pollingIntervals = new Map<string, NodeJS.Timeout>()
  private webSocketConnections = new Map<string, () => void>()

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

      // Placeholder for WebSocket connection
      this.webSocketConnections.set(subscriptionId, connectWebSocket(address, callback))

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

        // Disconnect WebSocket
        const disconnectWebSocket = this.webSocketConnections.get(subscriptionId)
        if (disconnectWebSocket) {
          disconnectWebSocket()
          this.webSocketConnections.delete(subscriptionId)
        }
      }
    }
  }

  disconnect() {
    // Clear all intervals
    for (const interval of this.pollingIntervals.values()) {
      clearInterval(interval)
    }

    // Disconnect all WebSockets
    for (const disconnect of this.webSocketConnections.values()) {
      disconnect()
    }

    this.subscriptions.clear()
    this.pollingIntervals.clear()
    this.webSocketConnections.clear()
  }
}

// Singleton instance
export const webSocketService = new WebSocketService()

export const connectWebSocket = (address: string, onUpdate: (data: any) => void) => {
  console.log(`Connecting WebSocket for address: ${address}`)
  // In a real application, you would establish a WebSocket connection here
  // and listen for events related to the address.
  // Example:
  // const ws = new WebSocket(`wss://your-websocket-api.com/ws?address=${address}`);
  // ws.onmessage = (event) => {
  //     const data = JSON.parse(event.data);
  //     onUpdate(data);
  // };
  // return () => ws.close(); // Return a cleanup function
  return () => console.log(`Disconnected WebSocket for address: ${address}`)
}
