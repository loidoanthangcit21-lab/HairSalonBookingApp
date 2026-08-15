import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Appbar,
  Card,
  Chip,
  Icon,
  Text,
  useTheme,
} from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../../services/bookingService';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { EmptyState } from '../../components/EmptyState';
import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  BookingStatus,
} from '../../constants/bookingStatus';

export const MyBookingsScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [historyFilter, setHistoryFilter] = useState<string>('all');

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['myBookings'],
    queryFn: () => bookingService.getMyBookings(),
  });

  const allBookings = bookings || [];

  const upcomingBookings = allBookings.filter(
    (b) => b.status === BookingStatus.PENDING || b.status === BookingStatus.CONFIRMED
  );

  const historyBookings = allBookings.filter(
    (b) =>
      b.status === BookingStatus.COMPLETED ||
      b.status === BookingStatus.CANCELED ||
      b.status === BookingStatus.NO_SHOW
  );

  const filteredHistory = historyBookings.filter((b) => {
    if (historyFilter === 'completed') return b.status === BookingStatus.COMPLETED;
    if (historyFilter === 'canceled') return b.status === BookingStatus.CANCELED;
    if (historyFilter === 'no_show') return b.status === BookingStatus.NO_SHOW;
    return true;
  });

  if (isLoading) {
    return <LoadingOverlay message="Fetching your appointment history..." />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction
          onPress={() => navigation.navigate('CustomerMainTabs', { screen: 'HomeTab' })}
        />
        <Appbar.Content title="My Appointments" />
        <Appbar.Action
          icon="bell-outline"
          onPress={() => navigation.navigate('NotificationPanel')}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Banner Section */}
        <View style={styles.bannerSection}>
          <Text variant="headlineSmall" style={styles.bannerTitle}>
            Your Beauty Schedule ✨
          </Text>
          <Text variant="bodyMedium" style={styles.bannerSubtitle}>
            Stay on top of your appointments and never miss your glow time.
          </Text>
        </View>

        {/* Tab Toggle (Upcoming vs History) */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              activeTab === 'upcoming' && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setActiveTab('upcoming')}
          >
            <Icon
              source="calendar-clock"
              size={18}
              color={activeTab === 'upcoming' ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
            />
            <Text
              variant="labelLarge"
              style={[
                styles.toggleText,
                { color: activeTab === 'upcoming' ? theme.colors.onPrimary : theme.colors.onSurfaceVariant },
              ]}
            >
              Upcoming
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              activeTab === 'history' && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setActiveTab('history')}
          >
            <Icon
              source="history"
              size={18}
              color={activeTab === 'history' ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
            />
            <Text
              variant="labelLarge"
              style={[
                styles.toggleText,
                { color: activeTab === 'history' ? theme.colors.onPrimary : theme.colors.onSurfaceVariant },
              ]}
            >
              History
            </Text>
          </TouchableOpacity>
        </View>

        {/* CONTENT FOR UPCOMING TAB */}
        {activeTab === 'upcoming' ? (
          <>
            {/* Section 1: Upcoming Appointments */}
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Upcoming Appointment
            </Text>

            {upcomingBookings.length === 0 ? (
              <EmptyState
                icon="calendar-blank"
                title="No Upcoming Appointments"
                description="You have no active or confirmed bookings right now."
                actionLabel="Book Appointment Now"
                onAction={() => navigation.navigate('BookAppointment')}
              />
            ) : (
              upcomingBookings.map((item) => {
                const statusColor = BOOKING_STATUS_COLORS[item.status] || '#757575';
                const serviceTitle = item.services.map((s) => s.title).join(', ');
                return (
                  <Card
                    key={item.id}
                    mode="outlined"
                    style={styles.upcomingCard}
                    onPress={() => navigation.navigate('BookingDetail', { booking: item })}
                  >
                    <View style={styles.cardRow}>
                      <Image
                        source={{
                          uri:
                            item.services[0]?.imageUrl ||
                            'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=400',
                        }}
                        style={styles.cardImage}
                      />
                      <View style={styles.cardInfo}>
                        <Text variant="titleMedium" numberOfLines={1} style={{ fontWeight: 'bold' }}>
                          {serviceTitle}
                        </Text>
                        <Text variant="bodySmall" style={{ opacity: 0.7, marginVertical: 2 }}>
                          with {item.stylistName}
                        </Text>
                        <View style={styles.metaLine}>
                          <Icon source="calendar" size={14} color={theme.colors.primary} />
                          <Text variant="bodySmall" style={{ opacity: 0.8 }}>
                            {item.bookingDate} • {item.timeSlot}
                          </Text>
                        </View>

                        <Chip
                          compact
                          style={{
                            backgroundColor: statusColor + '20',
                            marginTop: 6,
                            alignSelf: 'flex-start',
                          }}
                          textStyle={{ color: statusColor, fontWeight: 'bold', fontSize: 11 }}
                        >
                          {BOOKING_STATUS_LABELS[item.status]}
                        </Chip>
                      </View>
                    </View>
                  </Card>
                );
              })
            )}

            {/* Section 2: Booking History Preview */}
            <View style={styles.sectionHeaderRow}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Booking History
              </Text>
              <TouchableOpacity
                style={styles.seeAllBtn}
                onPress={() => setActiveTab('history')}
              >
                <Text variant="labelLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                  See All
                </Text>
                <Icon source="arrow-right" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>

            {historyBookings.length === 0 ? (
              <Text variant="bodyMedium" style={{ opacity: 0.6, marginVertical: 8 }}>
                No completed or past booking history yet.
              </Text>
            ) : (
              historyBookings.slice(0, 3).map((item) => {
                const statusColor = BOOKING_STATUS_COLORS[item.status] || '#757575';
                const serviceTitle = item.services.map((s) => s.title).join(', ');
                return (
                  <Card
                    key={item.id}
                    mode="outlined"
                    style={styles.historyCard}
                    onPress={() => navigation.navigate('BookingDetail', { booking: item })}
                  >
                    <View style={styles.cardRow}>
                      <Image
                        source={{
                          uri:
                            item.services[0]?.imageUrl ||
                            'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=400',
                        }}
                        style={styles.cardImageSmall}
                      />
                      <View style={styles.cardInfo}>
                        <Text variant="titleSmall" numberOfLines={1} style={{ fontWeight: 'bold' }}>
                          {serviceTitle}
                        </Text>
                        <Text variant="bodySmall" style={{ opacity: 0.7, marginVertical: 2 }}>
                          with {item.stylistName}
                        </Text>
                        <View style={styles.metaLine}>
                          <Icon source="calendar" size={14} color={theme.colors.outline} />
                          <Text variant="bodySmall" style={{ opacity: 0.8 }}>
                            {item.bookingDate} • {item.timeSlot}
                          </Text>
                        </View>
                      </View>
                      <Chip
                        compact
                        style={{
                          backgroundColor: statusColor + '20',
                          alignSelf: 'center',
                        }}
                        textStyle={{ color: statusColor, fontWeight: 'bold', fontSize: 11 }}
                      >
                        {BOOKING_STATUS_LABELS[item.status]}
                      </Chip>
                    </View>
                  </Card>
                );
              })
            )}
          </>
        ) : (
          <>
            {/* Filter Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              {[
                { value: 'all', label: 'All' },
                { value: 'completed', label: 'Completed' },
                { value: 'canceled', label: 'Canceled' },
                { value: 'no_show', label: 'No Show' },
              ].map((item) => (
                <Chip
                  key={item.value}
                  mode={historyFilter === item.value ? 'flat' : 'outlined'}
                  selected={historyFilter === item.value}
                  onPress={() => setHistoryFilter(item.value)}
                  showSelectedCheck={false}
                  style={styles.filterChip}
                >
                  {item.label}
                </Chip>
              ))}
            </ScrollView>

            {filteredHistory.length === 0 ? (
              <EmptyState
                icon="history"
                title="No History Found"
                description="No past appointments match this filter."
              />
            ) : (
              filteredHistory.map((item) => {
                const statusColor = BOOKING_STATUS_COLORS[item.status] || '#757575';
                const serviceTitle = item.services.map((s) => s.title).join(', ');
                return (
                  <Card
                    key={item.id}
                    mode="outlined"
                    style={styles.historyCard}
                    onPress={() => navigation.navigate('BookingDetail', { booking: item })}
                  >
                    <View style={styles.cardRow}>
                      <Image
                        source={{
                          uri:
                            item.services[0]?.imageUrl ||
                            'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=400',
                        }}
                        style={styles.cardImageSmall}
                      />
                      <View style={styles.cardInfo}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text variant="titleSmall" numberOfLines={1} style={{ fontWeight: 'bold', flex: 1 }}>
                            {serviceTitle}
                          </Text>
                          <Chip
                            compact
                            style={{ backgroundColor: statusColor + '20', marginLeft: 6 }}
                            textStyle={{ color: statusColor, fontWeight: 'bold', fontSize: 11 }}
                          >
                            {BOOKING_STATUS_LABELS[item.status]}
                          </Chip>
                        </View>
                        <Text variant="bodySmall" style={{ opacity: 0.7, marginVertical: 2 }}>
                          with {item.stylistName}
                        </Text>
                        <View style={styles.metaLine}>
                          <Icon source="calendar-clock" size={14} color={theme.colors.outline} />
                          <Text variant="bodySmall" style={{ opacity: 0.8 }}>
                            {item.bookingDate} • {item.timeSlot}
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                          <Text variant="titleSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                            ${item.totalAmount}
                          </Text>
                        </View>
                      </View>
                      <Icon source="chevron-right" size={20} color={theme.colors.outline} />
                    </View>
                  </Card>
                );
              })
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  bannerSection: {
    marginBottom: 16,
  },
  bannerTitle: {
    fontWeight: 'bold',
  },
  bannerSubtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F3EDF7',
    borderRadius: 24,
    padding: 4,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  toggleText: {
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 12,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  upcomingCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  historyCard: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  cardImage: {
    width: 100,
    height: 110,
    borderRadius: 12,
  },
  cardImageSmall: {
    width: 80,
    height: 85,
    borderRadius: 12,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterChip: {
    marginRight: 8,
  },
});
