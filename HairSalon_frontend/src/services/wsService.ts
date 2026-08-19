/**
 * wsService.ts – STOMP over WebSocket singleton for real-time events.
 *
 * Connects to the Spring backend at ws://10.0.2.2:8081/ws using @stomp/stompjs.
 * Subscribes to:
 *   /user/queue/notifications      → pushes live notifications for logged-in user
 *   /user/queue/booking-updates    → pushes live booking status changes
 *   /topic/occupied-slots          → broadcast when any booking is placed/updated
 */

import 'fast-text-encoding';
import { Client, IMessage } from '@stomp/stompjs';
import { ENV } from '../config/env';


const WS_URL = ENV.API_BASE_URL.replace(/^http/, 'ws').replace('/api', '') + '/ws';

type Callback<T = any> = (data: T) => void;

class WsService {
  private client: Client | null = null;
  private notificationCallbacks: Callback[] = [];
  private bookingUpdateCallbacks: Callback[] = [];
  private connected = false;

  connect(token: string): void {
    if (this.connected || this.client?.active) return;

    this.client = new Client({
      brokerURL: WS_URL,
      webSocketFactory: () => new WebSocket(WS_URL),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 3000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        this.connected = true;

        // 1. User specific notifications
        this.client?.subscribe('/user/queue/notifications', (msg: IMessage) => {
          try {
            const data = JSON.parse(msg.body);
            this.notificationCallbacks.forEach((cb) => cb(data));
          } catch (e) {
            // ignore
          }
        });

        // 2. User specific booking updates
        this.client?.subscribe('/user/queue/booking-updates', (msg: IMessage) => {
          try {
            const data = JSON.parse(msg.body);
            this.bookingUpdateCallbacks.forEach((cb) => cb(data));
          } catch (e) {
            // ignore
          }
        });

        // 3. Broadcast topic for all occupied slot changes
        this.client?.subscribe('/topic/occupied-slots', (msg: IMessage) => {
          try {
            const data = JSON.parse(msg.body);
            this.bookingUpdateCallbacks.forEach((cb) => cb(data));
          } catch (e) {
            // ignore
          }
        });
      },
      onDisconnect: () => {
        this.connected = false;
      },
      onStompError: (frame) => {
        this.connected = false;
      },
    });

    this.client.activate();
  }

  disconnect(): void {
    this.client?.deactivate();
    this.client = null;
    this.connected = false;
    this.notificationCallbacks = [];
    this.bookingUpdateCallbacks = [];
  }

  onNotification(cb: Callback): () => void {
    this.notificationCallbacks.push(cb);
    return () => {
      this.notificationCallbacks = this.notificationCallbacks.filter((f) => f !== cb);
    };
  }

  onBookingUpdate(cb: Callback): () => void {
    this.bookingUpdateCallbacks.push(cb);
    return () => {
      this.bookingUpdateCallbacks = this.bookingUpdateCallbacks.filter((f) => f !== cb);
    };
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const wsService = new WsService();
