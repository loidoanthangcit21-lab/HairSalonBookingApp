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

type ViewMode = 'main' | 'all_upcoming' | 'all_history';

export const MyBookingsScreen = ({ navigation, route }: any) => {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>(
    route?.params?.initialView === 'history' ? 'all_history' : 'main'
  );
  const [historyFilter, setHistoryFilter] = useState<string>('all');

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['myBookings'],
    queryFn: () => bookingService.getMyBookings(),
    refetchInterval: 5000,
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

  if (isLoading && !bookings) {
    return <LoadingOverlay message="Fetching your appointment history..." />;
  }

  const handleHeaderBack = () => {
    if (viewMode !== 'main') {
      setViewMode('main');
    } else {
      navigation.navigate('CustomerMainTabs', { screen: 'HomeTab' });
    }
  };

  const getPageTitle = () => {
    if (viewMode === 'all_upcoming') return 'Upcoming Appointments';
    if (viewMode === 'all_history') return 'Booking History';
    return 'My Appointments';
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={handleHeaderBack} />
        <Appbar.Content title={getPageTitle()} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        {/* ── MODE 1: MAIN OVERVIEW VIEW ─────────────────────────────────────── */}
        {viewMode === 'main' && (
          <>
            {/* Banner Section */}
            <View style={styles.bannerSection}>
              <Text variant="headlineSmall" style={styles.bannerTitle}>
                Your Beauty Schedule ✨
              </Text>
              <Text variant="bodyMedium" style={styles.bannerSubtitle}>
                Stay on top of your appointments and never miss your glow time.
              </Text>
            </View>

            {/* SECTION 1: UPCOMING APPOINTMENTS */}
            <View style={styles.sectionHeaderRow}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Upcoming Appointments ({upcomingBookings.length})
              </Text>
              {upcomingBookings.length > 2 && (
                <TouchableOpacity
                  style={styles.seeAllBtn}
                  onPress={() => setViewMode('all_upcoming')}
                >
                  <Text variant="labelLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                    See All
                  </Text>
                  <Icon source="arrow-right" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              )}
            </View>

            {upcomingBookings.length === 0 ? (
              <EmptyState
                icon="calendar-blank"
                title="No Upcoming Appointments"
                description="You have no active or confirmed bookings right now."
                actionLabel="Book Appointment Now"
                onAction={() => navigation.navigate('BookAppointment')}
              />
            ) : (
              upcomingBookings.slice(0, 2).map((item) => {
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

            {/* SECTION 2: BOOKING HISTORY PREVIEW */}
            <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Booking History ({historyBookings.length})
              </Text>
              <TouchableOpacity
                style={styles.seeAllBtn}
                onPress={() => setViewMode('all_history')}
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
        )}

        {/* ── MODE 2: DEDICATED FULL UPCOMING SCREEN ───────────────────────── */}
        {viewMode === 'all_upcoming' && (
          <View>
            <Text variant="bodyMedium" style={{ opacity: 0.7, marginBottom: 12 }}>
              All scheduled appointments that are active or confirmed.
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
          </View>
        )}

        {/* ── MODE 3: DEDICATED FULL HISTORY SCREEN ────────────────────────── */}
        {viewMode === 'all_history' && (
          <View>
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
                title="No History Records"
                description="No appointment records match your selected filter."
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
                        <Text variant="titleMedium" numberOfLines={1} style={{ fontWeight: 'bold' }}>
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
          </View>
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
    marginBottom: 20,
  },
  bannerTitle: {
    fontWeight: 'bold',
  },
  bannerSubtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  sectionTitle: {
    fontWeight: 'bold',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upcomingCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  historyCard: {
    marginBottom: 10,
    borderRadius: 12,
  },
  cardRow: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  cardImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  cardImageSmall: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  filterRow: {
    marginBottom: 16,
  },
  filterChip: {
    marginRight: 8,
  },
});
