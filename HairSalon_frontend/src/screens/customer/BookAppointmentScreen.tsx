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
  Avatar,
  Button,
  Card,
  Chip,
  Divider,
  Icon,
  List,
  Snackbar,
  Surface,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { DatePickerModal, en, registerTranslation } from 'react-native-paper-dates';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../../services/bookingService';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { useAppSelector } from '../../store';
import { ServiceItem } from '../../types/service';
import { BookingStatus } from '../../constants/bookingStatus';

registerTranslation('en', en);

export const BookAppointmentScreen = ({ navigation, route }: any) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const user = useAppSelector((state) => state.auth.user);

  const initialServiceId = route?.params?.selectedServiceId || 'srv_1';
  const initialStylistId = route?.params?.selectedStylistId || 'usr_stylist_1';

  const upcomingDates = React.useMemo(() => {
    const datesList = [];
    const today = new Date();
    for (let i = 0; i < 2; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayLabel = i === 0 ? 'Today' : 'Tomorrow';
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      datesList.push({ label: dayLabel, value: `${yyyy}-${mm}-${dd}` });
    }
    return datesList;
  }, []);

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(
    initialServiceId ? [initialServiceId] : ['srv_1']
  );
  const [selectedDate, setSelectedDate] = useState(upcomingDates[0].value);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('09:30 AM');
  const [selectedStylistId, setSelectedStylistId] = useState(initialStylistId);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [notes, setNotes] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);

  const { data: allBookings } = useQuery({
    queryKey: ['myBookings'],
    queryFn: () => bookingService.getMyBookings(),
  });

  const { data: services, isLoading: loadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: () => bookingService.getServices(),
  });

  const { data: stylists, isLoading: loadingStylists } = useQuery({
    queryKey: ['stylists'],
    queryFn: () => bookingService.getStylists(),
  });

  const isStylistBusy = React.useCallback(
    (stylistId: string, dateStr: string, slotStr: string): boolean => {
      if (!allBookings) return false;
      return allBookings.some(
        (b) =>
          b.id !== route?.params?.rescheduleBookingId &&
          (b.status === BookingStatus.PENDING || b.status === BookingStatus.CONFIRMED) &&
          (b.stylistId === stylistId ||
            b.stylistName?.toLowerCase()?.includes(stylistId.toLowerCase()) ||
            stylistId.toLowerCase().includes(b.stylistName?.toLowerCase() || '')) &&
          b.bookingDate === dateStr &&
          b.timeSlot === slotStr
      );
    },
    [allBookings, route?.params?.rescheduleBookingId]
  );

  React.useEffect(() => {
    if (stylists && stylists.length > 0) {
      const currentIsBusy = isStylistBusy(selectedStylistId, selectedDate, selectedTimeSlot);
      if (currentIsBusy) {
        const availableStylist = stylists.find(
          (st) => !isStylistBusy(st.id, selectedDate, selectedTimeSlot)
        );
        if (availableStylist) {
          setSelectedStylistId(availableStylist.id);
        }
      }
    }
  }, [selectedDate, selectedTimeSlot, stylists, isStylistBusy, selectedStylistId]);

  const toggleServiceSelection = (serviceId: string) => {
    setSelectedServiceIds((prev) => {
      if (prev.includes(serviceId)) {
        if (prev.length === 1) return prev; // Keep at least 1 selected
        return prev.filter((id) => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  const isSlotInPast = React.useCallback((dateStr: string, slotStr: string): boolean => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    if (dateStr !== todayStr) return false;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [time, period] = slotStr.split(' ');
    const [hoursStr, minsStr] = time.split(':');
    let hours = parseInt(hoursStr, 10);
    const mins = parseInt(minsStr, 10);
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const slotMinutes = hours * 60 + mins;
    return slotMinutes <= currentMinutes;
  }, []);

  const categories = [
    { id: 'all', name: 'All Services' },
    { id: 'cat_1', name: 'Haircuts' },
    { id: 'cat_2', name: 'Styling & Perm' },
    { id: 'cat_3', name: 'Coloring' },
    { id: 'cat_4', name: 'Spa & Care' },
  ];

  const timeSlots = [
    '08:00 AM',
    '08:45 AM',
    '09:30 AM',
    '10:15 AM',
    '11:00 AM',
    '11:45 AM',
    '12:30 PM',
    '01:15 PM',
    '02:00 PM',
    '02:45 PM',
    '03:30 PM',
    '04:15 PM',
    '05:00 PM',
    '05:45 PM',
    '06:30 PM',
    '07:15 PM',
    '08:00 PM',
    '08:45 PM',
  ];

  const chosenServices: ServiceItem[] = (services || []).filter((s) =>
    selectedServiceIds.includes(s.id)
  );

  const totalPrice = chosenServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = chosenServices.reduce((sum, s) => sum + (s.durationMinutes || 30), 0);

  const chosenStylist = (stylists || []).find((st) => st.id === selectedStylistId) || {
    id: 'usr_stylist_1',
    fullName: 'David Miller',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  };

  const filteredServices = (services || []).filter((s) => {
    if (selectedCategory === 'all') return true;
    return s.categoryId === selectedCategory;
  });

  const rescheduleBookingId = route?.params?.rescheduleBookingId;

  React.useEffect(() => {
    if (route?.params?.selectedServiceIds) {
      setSelectedServiceIds(route.params.selectedServiceIds);
    } else if (route?.params?.initialServiceIds) {
      setSelectedServiceIds(route.params.initialServiceIds);
    }

    if (route?.params?.initialStylistId) {
      setSelectedStylistId(route.params.initialStylistId);
    }
    if (route?.params?.initialDate) {
      setSelectedDate(route.params.initialDate);
    }
    if (route?.params?.initialTimeSlot) {
      setSelectedTimeSlot(route.params.initialTimeSlot);
    }
    if (route?.params?.initialNotes !== undefined) {
      setNotes(route.params.initialNotes);
    }
  }, [
    route?.params?.selectedServiceIds,
    route?.params?.initialServiceIds,
    route?.params?.initialStylistId,
    route?.params?.initialDate,
    route?.params?.initialTimeSlot,
    route?.params?.initialNotes,
  ]);

  const handleOpenCatalog = () => {
    navigation.navigate('BrowseServices', {
      isSelectionMode: true,
      selectedServiceIds,
      returnScreen: 'BookAppointment',
    });
  };

  const submitMutation = useMutation({
    mutationFn: () => {
      const dto = {
        serviceIds: selectedServiceIds,
        stylistId: selectedStylistId,
        bookingDate: selectedDate,
        timeSlot: selectedTimeSlot,
        notes,
        customerName: user?.fullName || 'Alex Johnson',
        customerPhone: user?.phone || '0901234567',
      };
      if (rescheduleBookingId) {
        return bookingService.rescheduleBooking(rescheduleBookingId, dto);
      }
      return bookingService.createBooking(dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      queryClient.invalidateQueries({ queryKey: ['todayBookings'] });
      queryClient.invalidateQueries({ queryKey: ['staffCreatedBookings'] });
      setSnackbarVisible(true);
      setTimeout(() => {
        navigation.navigate('CustomerMainTabs', { screen: 'MyBookingsTab' });
      }, 1500);
    },
  });

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  if (loadingServices || loadingStylists) {
    return <LoadingOverlay message="Preparing booking wizard..." />;
  }

  const stepsList = [
    { number: 1, title: 'Service' },
    { number: 2, title: 'Date & Time' },
    { number: 3, title: 'Stylist' },
    { number: 4, title: 'Confirm' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={handleBack} />
        <Appbar.Content
          title={
            rescheduleBookingId
              ? 'Reschedule Appointment'
              : currentStep === 1
              ? 'Select Services'
              : currentStep === 2
                ? 'Choose Date & Time'
                : currentStep === 3
                  ? 'Choose Specialist'
                  : 'Confirm Booking'
          }
        />
      </Appbar.Header>

      {/* Step Progress Bar Header */}
      <View style={styles.stepProgressRow}>
        {stepsList.map((step) => {
          const isActive = currentStep === step.number;
          const isDone = currentStep > step.number;
          return (
            <TouchableOpacity
              key={step.number}
              style={styles.stepItem}
              disabled={!isDone && !isActive}
              onPress={() => isDone && setCurrentStep(step.number)}
            >
              <View
                style={[
                  styles.stepBadge,
                  isActive && { backgroundColor: theme.colors.primary },
                  isDone && { backgroundColor: '#4CAF50' },
                ]}
              >
                {isDone ? (
                  <Icon source="check" size={14} color="#FFFFFF" />
                ) : (
                  <Text
                    style={[
                      styles.stepBadgeText,
                      isActive && { color: theme.colors.onPrimary },
                    ]}
                  >
                    {step.number}
                  </Text>
                )}
              </View>
              <Text
                variant="labelSmall"
                style={[
                  styles.stepLabel,
                  isActive && { fontWeight: 'bold', color: theme.colors.primary },
                ]}
              >
                {step.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* STEP 1: SELECT SERVICE */}
        {currentStep === 1 && (
          <View>
            <View style={styles.stepHeaderBox}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text variant="titleMedium" style={styles.stepHeaderTitle}>
                    What haircut experience are you looking for?
                  </Text>
                  <Text variant="bodySmall" style={{ opacity: 0.7, marginTop: 2 }}>
                    Select one or multiple services to get started.
                  </Text>
                </View>
                <Button
                  mode="text"
                  compact
                  onPress={handleOpenCatalog}
                  style={{ marginLeft: 8 }}
                >
                  Browse Catalog
                </Button>
              </View>
            </View>

            {/* Category Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {categories.map((cat) => (
                <Chip
                  key={cat.id}
                  mode={selectedCategory === cat.id ? 'flat' : 'outlined'}
                  selected={selectedCategory === cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  style={{ marginRight: 8 }}
                >
                  {cat.name}
                </Chip>
              ))}
            </ScrollView>

            {/* Service Cards */}
            {filteredServices.map((srv) => {
              const isSelected = selectedServiceIds.includes(srv.id);
              return (
                <TouchableOpacity
                  key={srv.id}
                  activeOpacity={0.8}
                  onPress={() => toggleServiceSelection(srv.id)}
                  style={[
                    styles.wizardCard,
                    {
                      marginBottom: 10,
                      borderWidth: 1,
                      borderColor: isSelected ? theme.colors.primary : '#E0E0E0',
                      backgroundColor: isSelected
                        ? theme.colors.primaryContainer + '20'
                        : theme.colors.surface,
                      borderRadius: 16,
                      overflow: 'hidden',
                    },
                    isSelected && {
                      borderWidth: 2,
                    },
                  ]}
                >
                  <View style={{ flexDirection: 'row', padding: 12, alignItems: 'center' }}>
                    <Image source={{ uri: srv.imageUrl }} style={styles.serviceImage} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                        {srv.title}
                      </Text>
                      <Text variant="bodySmall" numberOfLines={2} style={{ opacity: 0.7, marginVertical: 4 }}>
                        {srv.description}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 }}>
                        <Text variant="bodySmall" style={{ opacity: 0.8 }}>
                          ⏱️ {srv.durationMinutes} min
                        </Text>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                          ${srv.price}
                        </Text>
                      </View>
                    </View>
                    <Chip
                      compact
                      mode={isSelected ? 'flat' : 'outlined'}
                      selected={isSelected}
                      showSelectedCheck={false}
                      style={{ marginLeft: 8 }}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </Chip>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* STEP 2: CHOOSE DATE & TIME */}
        {currentStep === 2 && (
          <View>
            <View style={styles.stepHeaderBox}>
              <Text variant="titleMedium" style={styles.stepHeaderTitle}>
                Select Booking Date & Time
              </Text>
              <Text variant="bodySmall" style={{ opacity: 0.7, marginTop: 2 }}>
                Pick an available slot that suits your schedule best.
              </Text>
            </View>

            {/* Date Selection Row */}
            <Text variant="titleSmall" style={{ fontWeight: 'bold', marginBottom: 8 }}>
              Upcoming Dates
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {upcomingDates.map((d) => (
                <Chip
                  key={d.value}
                  icon="calendar-today"
                  mode={selectedDate === d.value ? 'flat' : 'outlined'}
                  selected={selectedDate === d.value}
                  onPress={() => setSelectedDate(d.value)}
                  style={{ marginRight: 8 }}
                >
                  {d.label}
                </Chip>
              ))}
              {(() => {
                const isCustom = selectedDate !== upcomingDates[0]?.value && selectedDate !== upcomingDates[1]?.value;
                return (
                  <Chip
                    icon="calendar"
                    mode={isCustom ? 'flat' : 'outlined'}
                    selected={isCustom}
                    onPress={() => setOpenDatePicker(true)}
                    style={{ marginRight: 8 }}
                  >
                    {isCustom ? `Date: ${selectedDate}` : 'Custom Date'}
                  </Chip>
                );
              })()}
            </ScrollView>

            <DatePickerModal
              locale="en"
              mode="single"
              visible={openDatePicker}
              onDismiss={() => setOpenDatePicker(false)}
              date={new Date(selectedDate)}
              validRange={{ startDate: new Date() }}
              onConfirm={(params) => {
                setOpenDatePicker(false);
                if (params.date) {
                  const yyyy = params.date.getFullYear();
                  const mm = String(params.date.getMonth() + 1).padStart(2, '0');
                  const dd = String(params.date.getDate()).padStart(2, '0');
                  setSelectedDate(`${yyyy}-${mm}-${dd}`);
                }
              }}
            />

            {/* Time Slot Grid */}
            <Text variant="titleSmall" style={{ fontWeight: 'bold', marginBottom: 8 }}>
              Available Time Slots ({selectedDate})
            </Text>
            <View style={styles.timeGrid}>
              {timeSlots.map((slot) => {
                const disabled = isSlotInPast(selectedDate, slot);
                const isSelected = selectedTimeSlot === slot;
                return (
                  <Chip
                    key={slot}
                    mode={isSelected ? 'flat' : 'outlined'}
                    selected={isSelected}
                    disabled={disabled}
                    onPress={() => !disabled && setSelectedTimeSlot(slot)}
                    showSelectedCheck={false}
                    style={[
                      styles.timeChip,
                      disabled && { opacity: 0.4, backgroundColor: theme.colors.surfaceDisabled },
                    ]}
                  >
                    {slot} {disabled ? '(Passed)' : ''}
                  </Chip>
                );
              })}
            </View>

            {/* Selected Service Preview Box */}
            <Card mode="outlined" style={[styles.wizardCard, { marginTop: 16 }]}>
              <Card.Content>
                <Text variant="labelMedium" style={{ opacity: 0.6 }}>Selected Services ({chosenServices.length})</Text>
                {chosenServices.map((srv) => (
                  <View key={srv.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                    <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>{srv.title}</Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>${srv.price}</Text>
                  </View>
                ))}
              </Card.Content>
            </Card>
          </View>
        )}

        {/* STEP 3: CHOOSE SPECIALIST / STYLIST */}
        {currentStep === 3 && (
          <View>
            <View style={styles.stepHeaderBox}>
              <Text variant="titleMedium" style={styles.stepHeaderTitle}>
                Choose Your Hair Specialist
              </Text>
              <Text variant="bodySmall" style={{ opacity: 0.7, marginTop: 2 }}>
                Select a master stylist that fits your desired hair style.
              </Text>
            </View>

            {(stylists || []).map((st) => {
              const isSelected = selectedStylistId === st.id;
              const isBusy = isStylistBusy(st.id, selectedDate, selectedTimeSlot);
              return (
                <TouchableOpacity
                  key={st.id}
                  activeOpacity={0.8}
                  disabled={isBusy}
                  onPress={() => !isBusy && setSelectedStylistId(st.id)}
                  style={[
                    styles.wizardCard,
                    {
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: isSelected ? theme.colors.primary : '#E0E0E0',
                      backgroundColor: isBusy
                        ? '#F5F5F5'
                        : isSelected
                        ? theme.colors.primaryContainer + '20'
                        : theme.colors.surface,
                      borderRadius: 16,
                      opacity: isBusy ? 0.55 : 1,
                    },
                    isSelected && {
                      borderWidth: 2,
                    },
                  ]}
                >
                  <View style={{ flexDirection: 'row', padding: 10, alignItems: 'center' }}>
                    <Avatar.Image size={48} source={{ uri: st.avatarUrl }} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text
                        variant="titleSmall"
                        style={{
                          fontWeight: 'bold',
                          color: isBusy ? '#757575' : theme.colors.onSurface,
                        }}
                      >
                        {st.fullName}
                      </Text>
                      <Chip
                        icon="content-cut"
                        compact
                        style={{ marginVertical: 2, alignSelf: 'flex-start', maxWidth: '100%' }}
                      >
                        <Text variant="labelSmall" numberOfLines={1} style={{ maxWidth: 110 }}>
                          {st.specialty}
                        </Text>
                      </Chip>
                    </View>
                    {isBusy ? (
                      <Chip
                        compact
                        icon="clock-alert-outline"
                        style={{ backgroundColor: '#FFEBEE', marginLeft: 8 }}
                        textStyle={{ color: '#D32F2F', fontWeight: 'bold', fontSize: 11 }}
                      >
                        Not Available
                      </Chip>
                    ) : (
                      <Chip
                        compact
                        mode={isSelected ? 'flat' : 'outlined'}
                        selected={isSelected}
                        showSelectedCheck={false}
                        style={{ marginLeft: 8 }}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </Chip>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* STEP 4: FINAL CONFIRMATION */}
        {currentStep === 4 && (
          <View>
            <View style={styles.stepHeaderBox}>
              <Text variant="titleMedium" style={styles.stepHeaderTitle}>
                Review & Confirm Appointment
              </Text>
              <Text variant="bodySmall" style={{ opacity: 0.7, marginTop: 2 }}>
                Double check your booking details before confirmation.
              </Text>
            </View>

            <Card mode="outlined" style={styles.wizardCard}>
              <Card.Content>
                <List.Item
                  title="Selected Services"
                  description={`${chosenServices.map((s) => s.title).join(', ')} (${totalDuration} mins)`}
                  left={(p) => <List.Icon {...p} icon="scissors-cutting" />}
                />
                <Divider />
                <List.Item
                  title="Date & Time Slot"
                  description={`${selectedDate} at ${selectedTimeSlot}`}
                  left={(p) => <List.Icon {...p} icon="calendar-clock" />}
                />
                <Divider />
                <List.Item
                  title="Assigned Stylist"
                  description={chosenStylist.fullName}
                  left={(p) => <List.Icon {...p} icon="account-star" />}
                />
                <Divider />
                <List.Item
                  title="Payment Method"
                  description="Cash on Checkout"
                  left={(p) => <List.Icon {...p} icon="cash" />}
                />
              </Card.Content>
            </Card>

            {/* Special Requests / Notes Input */}
            <Text variant="titleSmall" style={{ fontWeight: 'bold', marginTop: 16, marginBottom: 8 }}>
              Special Instructions / Notes
            </Text>
            <TextInput
              label="Optional requests for your haircut"
              mode="outlined"
              left={<TextInput.Icon icon="notebook-edit-outline" />}
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Wash hair after cut, low fade style..."
            />
          </View>
        )}
      </ScrollView>

      {/* Wizard Sticky Bottom Control Bar */}
      <Surface elevation={3} style={styles.bottomBar}>
        <View style={styles.totalRow}>
          <Text variant="labelMedium" style={{ opacity: 0.6 }}>
            {selectedServiceIds.length} Service{selectedServiceIds.length > 1 ? 's' : ''} Selected
          </Text>
          <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
            ${totalPrice}
          </Text>
        </View>

        {currentStep < 4 ? (
          <Button
            mode="contained"
            icon="arrow-right"
            contentStyle={{ flexDirection: 'row-reverse' }}
            onPress={() => setCurrentStep(currentStep + 1)}
            style={styles.continueBtn}
          >
            Continue
          </Button>
        ) : (
          <Button
            mode="contained"
            icon="check-circle"
            loading={submitMutation.isPending}
            disabled={submitMutation.isPending}
            onPress={() => submitMutation.mutate()}
            style={styles.continueBtn}
          >
            {rescheduleBookingId ? 'CONFIRM RESCHEDULE' : 'CONFIRM BOOKING'}
          </Button>
        )}
      </Surface>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
      >
        {rescheduleBookingId
          ? 'Appointment rescheduled successfully!'
          : 'Appointment booked successfully!'}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 100,
  },
  stepProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F3EDF7',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  stepItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#666666',
  },
  stepLabel: {
    color: '#666666',
  },
  stepHeaderBox: {
    marginBottom: 16,
  },
  stepHeaderTitle: {
    fontWeight: 'bold',
  },
  wizardCard: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  serviceImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  timeChip: {
    marginRight: 6,
    marginBottom: 6,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  totalRow: {
    justifyContent: 'center',
  },
  continueBtn: {
    borderRadius: 24,
    paddingHorizontal: 12,
  },
});
