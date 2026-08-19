import React, { useState } from 'react';
import {
  Alert,
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

  const initialServiceId = route?.params?.selectedServiceId || null;
  const initialStylistId = route?.params?.selectedStylistId || null;

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
    initialServiceId ? [initialServiceId] : []
  );
  const [selectedDate, setSelectedDate] = useState(upcomingDates[0].value);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('09:30 AM');
  const [selectedStylistId, setSelectedStylistId] = useState(initialStylistId || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [notes, setNotes] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);

  // occupiedSlots = all active bookings system-wide (for expert availability)
  const { data: occupiedBookings } = useQuery({
    queryKey: ['occupiedSlots'],
    queryFn: () => bookingService.getOccupiedSlots(),
  });

  // myBookings = this customer's own bookings (for customer-overlap check)
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

  /**
   * isStylistBusy — checks occupiedSlots (system-wide active bookings) by expert UUID.
   * NEVER match by name to avoid false positives with similar names.
   */
  const isStylistBusy = React.useCallback(
    (stylistId: string, dateStr: string, slotStr: string): boolean => {
      if (!occupiedBookings) return false;
      return occupiedBookings.some(
        (b) =>
          b.id !== route?.params?.rescheduleBookingId &&
          (b.status === BookingStatus.PENDING || b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.CHECK_IN) &&
          (b.stylistId === stylistId || b.expertId === stylistId) &&
          b.bookingDate === dateStr &&
          b.timeSlot === slotStr
      );
    },
    [occupiedBookings, route?.params?.rescheduleBookingId]
  );



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

  const { data: fetchedCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => bookingService.getCategories(),
  });

  const categories = [
    { id: 'all', name: 'All Services' },
    ...(fetchedCategories || []),
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

  // 1. Filter stylists matching the categories of chosen services
  const selectedServiceCategoryIds = React.useMemo(() => {
    const ids = new Set<string>();
    const names = new Set<string>();
    chosenServices.forEach((s) => {
      if (s.categoryId) ids.add(s.categoryId);
      if (s.categoryName) names.add(s.categoryName.toLowerCase());
    });
    return { ids: Array.from(ids), names: Array.from(names) };
  }, [chosenServices]);

  const matchingStylists = React.useMemo(() => {
    if (!stylists) return [];
    if (selectedServiceCategoryIds.ids.length === 0 && selectedServiceCategoryIds.names.length === 0) {
      return stylists;
    }
    return stylists.filter((st) => {
      if (!st.categories || st.categories.length === 0) return true;
      return st.categories.some(
        (c) =>
          selectedServiceCategoryIds.ids.includes(c.id) ||
          selectedServiceCategoryIds.names.includes(c.name.toLowerCase())
      );
    });
  }, [stylists, selectedServiceCategoryIds]);

  const chosenStylist = (stylists || []).find((st) => st.id === selectedStylistId);

  // Helper to pick a free stylist randomly from matching stylists
  const pickRandomFreeStylist = React.useCallback(
    (dateStr: string, slotStr: string): string | null => {
      const candidates = (matchingStylists.length > 0 ? matchingStylists : stylists || []).filter(
        (st) => !isStylistBusy(st.id, dateStr, slotStr)
      );
      if (candidates.length === 0) return null;
      const randomIndex = Math.floor(Math.random() * candidates.length);
      return candidates[randomIndex].id;
    },
    [matchingStylists, stylists, isStylistBusy]
  );

  const handleSelectTimeSlot = (slot: string) => {
    setSelectedTimeSlot(slot);
    // If user chose Any Stylist or no specific stylist yet, auto-assign a free expert randomly
    if (!selectedStylistId || selectedStylistId === 'ANY_STYLIST') {
      const assignedId = pickRandomFreeStylist(selectedDate, slot);
      if (assignedId) {
        setSelectedStylistId(assignedId);
      }
    }
  };

  const isCustomerBusyAtSlot = React.useCallback(
    (dateStr: string, slotStr: string): boolean => {
      if (!allBookings) return false;
      return allBookings.some(
        (b) =>
          b.id !== route?.params?.rescheduleBookingId &&
          (b.status === BookingStatus.PENDING || b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.CHECK_IN) &&
          b.bookingDate === dateStr &&
          b.timeSlot === slotStr
      );
    },
    [allBookings, route?.params?.rescheduleBookingId]
  );

  const isSlotAvailable = React.useCallback(
    (dateStr: string, slotStr: string): boolean => {
      if (isSlotInPast(dateStr, slotStr)) return false;
      if (isCustomerBusyAtSlot(dateStr, slotStr)) return false;
      if (!selectedStylistId || selectedStylistId === 'ANY_STYLIST') {
        // At least 1 candidate stylist must be free
        const candidates = matchingStylists.length > 0 ? matchingStylists : stylists || [];
        return candidates.some((st) => !isStylistBusy(st.id, dateStr, slotStr));
      }
      return !isStylistBusy(selectedStylistId, dateStr, slotStr);
    },
    [isSlotInPast, isCustomerBusyAtSlot, selectedStylistId, matchingStylists, stylists, isStylistBusy]
  );


  const filteredServices = (services || []).filter((s) => {
    if (selectedCategory === 'all') return true;
    const catObj = (fetchedCategories || []).find((c) => c.id === selectedCategory);
    const catName = catObj ? catObj.name.toLowerCase() : selectedCategory.toLowerCase();
    return s.categoryId === selectedCategory || s.categoryName?.toLowerCase() === catName;
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

  const submitMutation = useMutation({
    mutationFn: () => {
      let finalStylistId = selectedStylistId;
      if (!finalStylistId || finalStylistId === 'ANY_STYLIST') {
        const assignedId = pickRandomFreeStylist(selectedDate, selectedTimeSlot);
        finalStylistId = assignedId || (stylists && stylists.length > 0 ? stylists[0].id : '');
      }

      const dto = {
        serviceIds: selectedServiceIds,
        stylistId: finalStylistId,
        bookingDate: selectedDate,
        timeSlot: selectedTimeSlot,
        notes,
        customerName: user?.fullName || 'Customer',
        customerPhone: user?.phone || '',
      };
      if (rescheduleBookingId) {
        return bookingService.rescheduleBooking(rescheduleBookingId, dto);
      }
      return bookingService.createBooking(dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      queryClient.invalidateQueries({ queryKey: ['occupiedSlots'] });
      queryClient.invalidateQueries({ queryKey: ['todayBookings'] });
      queryClient.invalidateQueries({ queryKey: ['staffCreatedBookings'] });
      setSnackbarVisible(true);
      setTimeout(() => {
        navigation.navigate('CustomerMainTabs', { screen: 'MyBookingsTab' });
      }, 1500);
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to place booking. Please try again.';
      const isSlotConflict =
        msg.includes('EXPERT_NOT_AVAILABLE') ||
        msg.toLowerCase().includes('already booked') ||
        msg.toLowerCase().includes('unavailable');
      Alert.alert(
        isSlotConflict ? 'Time Slot Unavailable ⚠️' : 'Booking Failed ❌',
        isSlotConflict
          ? 'The selected stylist is already booked for this date and time slot. Please select another time or stylist.'
          : msg
      );
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
    { number: 2, title: 'Stylist' },
    { number: 3, title: 'Date & Time' },
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
                ? 'Choose Specialist'
                : currentStep === 3
                  ? 'Choose Date & Time'
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
              <Text variant="titleMedium" style={styles.stepHeaderTitle}>
                What haircut experience are you looking for?
              </Text>
              <Text variant="bodySmall" style={{ opacity: 0.7, marginTop: 2 }}>
                Select one or multiple services to get started.
              </Text>
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
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
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

        {/* STEP 2: CHOOSE SPECIALIST / STYLIST */}
        {currentStep === 2 && (
          <View>
            <View style={styles.stepHeaderBox}>
              <Text variant="titleMedium" style={styles.stepHeaderTitle}>
                Choose Your Hair Specialist
              </Text>
              <Text variant="bodySmall" style={{ opacity: 0.7, marginTop: 2 }}>
                Stylists available for your selected services category.
              </Text>
            </View>

            {/* Any Available Stylist / Random Auto-Assign Option */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedStylistId('ANY_STYLIST')}
              style={[
                styles.wizardCard,
                {
                  marginBottom: 12,
                  borderWidth: selectedStylistId === 'ANY_STYLIST' || !selectedStylistId ? 2 : 1,
                  borderColor: selectedStylistId === 'ANY_STYLIST' || !selectedStylistId ? theme.colors.primary : '#E0E0E0',
                  backgroundColor: selectedStylistId === 'ANY_STYLIST' || !selectedStylistId
                    ? theme.colors.primaryContainer + '20'
                    : theme.colors.surface,
                  borderRadius: 16,
                },
              ]}
            >
              <View style={{ flexDirection: 'row', padding: 12, alignItems: 'center' }}>
                <Avatar.Icon size={48} icon="shuffle-variant" style={{ backgroundColor: theme.colors.primaryContainer }} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>
                    Any Available Stylist (Auto-Assign)
                  </Text>
                  <Text variant="bodySmall" style={{ opacity: 0.7, marginTop: 2 }}>
                    Let salon assign any available expert for your chosen slot.
                  </Text>
                </View>
                <Chip
                  compact
                  mode={selectedStylistId === 'ANY_STYLIST' || !selectedStylistId ? 'flat' : 'outlined'}
                  selected={selectedStylistId === 'ANY_STYLIST' || !selectedStylistId}
                  showSelectedCheck={false}
                  style={{ marginLeft: 8 }}
                >
                  {selectedStylistId === 'ANY_STYLIST' || !selectedStylistId ? 'Selected' : 'Select'}
                </Chip>
              </View>
            </TouchableOpacity>

            <Text variant="titleSmall" style={{ fontWeight: 'bold', marginBottom: 8, marginTop: 8 }}>
              Specific Experts ({matchingStylists.length})
            </Text>

            {matchingStylists.map((st) => {
              const isSelected = selectedStylistId === st.id;
              return (
                <TouchableOpacity
                  key={st.id}
                  activeOpacity={0.8}
                  onPress={() => setSelectedStylistId(st.id)}
                  style={[
                    styles.wizardCard,
                    {
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: isSelected ? theme.colors.primary : '#E0E0E0',
                      backgroundColor: isSelected
                        ? theme.colors.primaryContainer + '20'
                        : theme.colors.surface,
                      borderRadius: 16,
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
                        style={{ fontWeight: 'bold', color: theme.colors.onSurface }}
                      >
                        {st.fullName}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                        <Chip
                          icon="content-cut"
                          compact
                          style={{ flexShrink: 1, maxWidth: '100%' }}
                        >
                          <Text variant="labelSmall" numberOfLines={1} style={{ flexShrink: 1 }}>
                            {st.specialty || 'Master Stylist'}
                          </Text>
                        </Chip>
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

        {/* STEP 3: CHOOSE DATE & TIME */}
        {currentStep === 3 && (
          <View>
            <View style={styles.stepHeaderBox}>
              <Text variant="titleMedium" style={styles.stepHeaderTitle}>
                Select Booking Date & Time
              </Text>
              <Text variant="bodySmall" style={{ opacity: 0.7, marginTop: 2 }}>
                {chosenStylist
                  ? `Pick an available slot for ${chosenStylist.fullName}.`
                  : 'Pick an available slot that suits your schedule best.'}
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
                const available = isSlotAvailable(selectedDate, slot);
                const isSelected = selectedTimeSlot === slot;
                return (
                  <Chip
                    key={slot}
                    mode={isSelected ? 'flat' : 'outlined'}
                    selected={isSelected}
                    disabled={!available}
                    onPress={() => available && handleSelectTimeSlot(slot)}
                    showSelectedCheck={false}
                    style={[
                      styles.timeChip,
                      !available && { opacity: 0.4, backgroundColor: theme.colors.surfaceDisabled },
                    ]}
                  >
                    {slot} {!available ? '(Busy)' : ''}
                  </Chip>
                );
              })}
            </View>

            {/* Selected Service & Stylist Preview Box */}
            <Card mode="outlined" style={[styles.wizardCard, { marginTop: 16 }]}>
              <Card.Content>
                <Text variant="labelMedium" style={{ opacity: 0.6 }}>Summary Preview</Text>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold', marginTop: 4, color: theme.colors.primary }}>
                  Stylist: {chosenStylist ? chosenStylist.fullName : 'Any Available Stylist (Auto-Assigned)'}
                </Text>
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
                  description={chosenServices.map((s) => s.title).join(', ')}
                  left={(p) => <List.Icon {...p} icon="scissors-cutting" />}
                />
                <Divider />
                <List.Item
                  title="Assigned Stylist"
                  description={chosenStylist?.fullName || 'Not selected'}
                  left={(p) => <List.Icon {...p} icon="account-star" />}
                />
                <Divider />
                <List.Item
                  title="Date & Time Slot"
                  description={`${selectedDate} at ${selectedTimeSlot}`}
                  left={(p) => <List.Icon {...p} icon="calendar-clock" />}
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
            disabled={
              (currentStep === 1 && selectedServiceIds.length === 0) ||
              (currentStep === 2 && !selectedStylistId)
            }
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
