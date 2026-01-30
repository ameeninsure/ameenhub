// Simple event emitter for server-side notification broadcasting
type NotificationEvent = {
  type: 'new_notification';
  recipientType: 'user' | 'customer';
  recipientId: number;
  notification: {
    id?: number;
    title: string;
    message: string;
    type: string;
    senderId?: number;
    senderName?: string;
  };
};

type Listener = (event: NotificationEvent) => void;

class NotificationEventEmitter {
  private listeners: Map<string, Set<Listener>> = new Map();

  subscribe(recipientType: string, recipientId: number, listener: Listener): () => void {
    const key = `${recipientType}:${recipientId}`;
    
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    
    this.listeners.get(key)!.add(listener);
    console.log(`[SSE] Client subscribed: ${key}`);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(key);
      if (listeners) {
        listeners.delete(listener);
        console.log(`[SSE] Client unsubscribed: ${key}`);
        if (listeners.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  emit(recipientType: string, recipientId: number, notification: NotificationEvent['notification']): void {
    const key = `${recipientType}:${recipientId}`;
    const listeners = this.listeners.get(key);
    
    console.log(`[SSE] Broadcasting to ${key}, listeners: ${listeners?.size || 0}`);
    
    if (listeners) {
      const event: NotificationEvent = {
        type: 'new_notification',
        recipientType: recipientType as 'user' | 'customer',
        recipientId,
        notification,
      };
      
      listeners.forEach((listener) => {
        try {
          listener(event);
        } catch (error) {
          console.error('[SSE] Error calling listener:', error);
        }
      });
    }
  }

  getActiveConnections(): number {
    let total = 0;
    this.listeners.forEach((listeners) => {
      total += listeners.size;
    });
    return total;
  }
}

// Global singleton instance
export const notificationEvents = new NotificationEventEmitter();
