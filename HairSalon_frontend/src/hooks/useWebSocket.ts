
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

    const initWs = async () => {
      const token = await storage.getToken();
      if (!token) return;
      wsService.connect(token);
    };
    initWs();


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
