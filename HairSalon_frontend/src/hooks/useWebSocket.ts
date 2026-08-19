/**
 * useWebSocket.ts – Custom hook that:
 *   1. Connects to the STOMP WebSocket when the user is logged in.
 *   2. On receiving a notification event → invalidates ['notifications'] cache.
 *   3. On receiving a booking-update event → invalidates ['myBookings'],
 *      ['todayBookings'], ['staffCreatedBookings'], ['occupiedSlots'] caches.
 *   4. Disconnects automatically on logout.
 *
 * Mount this hook once in AppNavigator (or the authenticated root layout)
 * so it stays alive for the entire authenticated session.
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '../store';
import { wsService } from '../services/wsService';
import { storage } from '../utils/storage';

export const useWebSocket = () => {
  const queryClient = useQueryClient();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = !!user;

  useEffect(() => {
    if (!isAuthenticated) {
      wsService.disconnect();
      return;
    }

    // Get the stored JWT token and connect
    const initWs = async () => {
      const token = await storage.getToken();
      if (!token) return;
      wsService.connect(token);
    };
    initWs();

    // Register listeners
    const unsubNotif = wsService.onNotification(() => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    const unsubBooking = wsService.onBookingUpdate(() => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      queryClient.invalidateQueries({ queryKey: ['todayBookings'] });
      queryClient.invalidateQueries({ queryKey: ['staffCreatedBookings'] });
      queryClient.invalidateQueries({ queryKey: ['occupiedSlots'] });
    });

    return () => {
      unsubNotif();
      unsubBooking();
    };
  }, [isAuthenticated, queryClient]);
};
