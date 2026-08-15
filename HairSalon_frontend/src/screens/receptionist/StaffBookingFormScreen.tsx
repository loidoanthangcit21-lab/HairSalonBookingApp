import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Appbar,
  Avatar,
  Button,
  Card,
  Chip,
  HelperText,
  Icon,
  Snackbar,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../../services/bookingService';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { ServiceItem, Stylist } from '../../types/service';
import { BookingStatus } from '../../constants/bookingStatus';

const staffBookingSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  customerPhone: z.string().min(9, 'Phone number must be at least 9 digits'),
  serviceIds: z.array(z.string()).min(1, 'Please select at least one service'),
  stylistId: z.string().min(1, 'Please select a stylist'),
  bookingDate: z.string().min(1, 'Select a date'),
  timeSlot: z.string().min(1, 'Select a time slot'),
  notes: z.string().optional(),
});

type StaffBookingValues = z.infer<typeof staffBookingSchema>;

export const StaffBookingFormScreen = ({ navigation, route }: any) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);

  const { data: services, isLoading: loadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: () => bookingService.getServices(),
  });

  const { data: stylists, isLoading: loadingStylists } = useQuery({
    queryKey: ['stylists'],
    queryFn: () => bookingService.getStylists(),
  });

  const { data: allBookings } = useQuery({
    queryKey: ['myBookings'],
    queryFn: () => bookingService.getMyBookings(),
  });

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

  const timeSlotsList = [
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

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StaffBookingValues>({
    resolver: zodResolver(staffBookingSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      serviceIds: ['srv_1'],
      stylistId: 'usr_stylist_1',
      bookingDate: upcomingDates[0].value,
      timeSlot: '09:30 AM',
      notes: '',
    },
  });

  const selectedServiceIds = watch('serviceIds');
  const selectedStylistId = watch('stylistId');
  const selectedBookingDate = watch('bookingDate');
  const selectedTimeSlot = watch('timeSlot');

  useEffect(() => {
    if (route?.params?.selectedServiceIds) {
      setValue('serviceIds', route.params.selectedServiceIds);
    }
    if (route?.params?.selectedStylistId) {
      setValue('stylistId', route.params.selectedStylistId);
    }
  }, [route?.params?.selectedServiceIds, route?.params?.selectedStylistId, setValue]);

  const chosenServices: ServiceItem[] = (services || []).filter((s) =>
    (selectedServiceIds || []).includes(s.id)
  );

  const chosenStylist: Stylist | undefined = (stylists || []).find((st) => st.id === selectedStylistId);

  const isChosenStylistBusy = React.useMemo(() => {
    if (!selectedStylistId || !selectedBookingDate || !selectedTimeSlot || !allBookings) return false;
    return allBookings.some(
      (b) =>
        (b.status === BookingStatus.PENDING || b.status === BookingStatus.CONFIRMED) &&
        (b.stylistId === selectedStylistId ||
          b.stylistName?.toLowerCase()?.includes(selectedStylistId.toLowerCase()) ||
          selectedStylistId.toLowerCase().includes(b.stylistName?.toLowerCase() || '')) &&
        b.bookingDate === selectedBookingDate &&
        b.timeSlot === selectedTimeSlot
    );
  }, [selectedStylistId, selectedBookingDate, selectedTimeSlot, allBookings]);

  const totalPrice = chosenServices.reduce((sum, s) => sum + s.price, 0);

  const handleOpenServicesCatalog = () => {
    navigation.navigate('BrowseServices', {
      isSelectionMode: true,
      selectedServiceIds,
      returnScreen: 'StaffBookingForm',
    });
  };

  const handleOpenStylistsCatalog = () => {
    navigation.navigate('BrowseStylists', {
      isSelectionMode: true,
      selectedStylistId,
      selectedDate: selectedBookingDate,
      selectedTimeSlot,
      returnScreen: 'StaffBookingForm',
    });
  };

  const createMutation = useMutation({
    mutationFn: (values: StaffBookingValues) =>
      bookingService.createStaffBooking({
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        serviceIds: values.serviceIds,
        stylistId: values.stylistId,
        bookingDate: values.bookingDate,
        timeSlot: values.timeSlot,
        notes: values.notes,
        creationType: 'Walk-in',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayBookings'] });
      queryClient.invalidateQueries({ queryKey: ['staffCreatedBookings'] });
      setSnackbarVisible(true);
      setTimeout(() => {
        navigation.navigate('ReceptionistMainTabs', { screen: 'TrackingTab' });
      }, 1500);
    },
  });

  const onSubmit = (values: StaffBookingValues) => {
    createMutation.mutate(values);
  };

  if (loadingServices || loadingStylists) {
    return <LoadingOverlay message="Preparing walk-in booking form..." />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Create Walk-in Booking" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.badgeRow}>
          <Chip icon="account-tie" style={{ backgroundColor: theme.colors.primaryContainer }}>
            CreatedByStaff (Walk-in Entry)
          </Chip>
        </View>

        {/* Customer Name */}
        <Controller
          control={control}
          name="customerName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Customer Full Name *"
              mode="outlined"
              left={<TextInput.Icon icon="account" />}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.customerName}
              style={styles.input}
            />
          )}
        />
        {errors.customerName && (
          <HelperText type="error">{errors.customerName.message}</HelperText>
        )}

        {/* Customer Phone */}
        <Controller
          control={control}
          name="customerPhone"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Customer Phone Number *"
              mode="outlined"
              keyboardType="phone-pad"
              left={<TextInput.Icon icon="phone" />}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.customerPhone}
              style={styles.input}
            />
          )}
        />
        {errors.customerPhone && (
          <HelperText type="error">{errors.customerPhone.message}</HelperText>
        )}

        {/* Multi-Service Selection Header & Summary Card */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 8 }}>
          <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
            Selected Services:
          </Text>
          <Button
            mode="text"
            compact
            icon="scissors-cutting"
            onPress={handleOpenServicesCatalog}
          >
            {selectedServiceIds?.length ? 'Change Services' : '+ Select Services'}
          </Button>
        </View>
        {errors.serviceIds && (
          <HelperText type="error">{errors.serviceIds.message}</HelperText>
        )}

        {/* Selected Services Box */}
        <Card mode="outlined" style={styles.summaryBox} onPress={handleOpenServicesCatalog}>
          <Card.Content>
            {chosenServices.length === 0 ? (
              <Text variant="bodyMedium" style={{ opacity: 0.6, fontStyle: 'italic' }}>
                No services selected. Click to browse full catalog.
              </Text>
            ) : (
              <View>
                {chosenServices.map((srv) => (
                  <View key={srv.id} style={styles.serviceRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                      <Icon source="check-circle" size={16} color={theme.colors.primary} />
                      <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                        {srv.title}
                      </Text>
                    </View>
                    <Text variant="bodyMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                      ${srv.price}
                    </Text>
                  </View>
                ))}

                <View style={styles.totalRow}>
                  <Text variant="labelSmall" style={{ opacity: 0.6 }}>
                    Total ({chosenServices.length} item{chosenServices.length > 1 ? 's' : ''})
                  </Text>
                  <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                    ${totalPrice}
                  </Text>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Assigned Stylist Selection Header & Card */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 8 }}>
          <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
            Assigned Stylist:
          </Text>
          <Button
            mode="text"
            compact
            icon="account-star"
            onPress={handleOpenStylistsCatalog}
          >
            {chosenStylist ? 'Change Stylist' : '+ Select Stylist'}
          </Button>
        </View>
        {errors.stylistId && (
          <HelperText type="error">{errors.stylistId.message}</HelperText>
        )}

        {/* Assigned Stylist Box */}
        <Card
          mode="outlined"
          style={[
            styles.summaryBox,
            isChosenStylistBusy && { borderColor: '#D32F2F', backgroundColor: '#FFF8F8' },
          ]}
          onPress={handleOpenStylistsCatalog}
        >
          <Card.Content>
            {!chosenStylist ? (
              <Text variant="bodyMedium" style={{ opacity: 0.6, fontStyle: 'italic' }}>
                No stylist assigned. Click to select a master stylist.
              </Text>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Avatar.Image size={50} source={{ uri: chosenStylist.avatarUrl }} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                    {chosenStylist.fullName}
                  </Text>
                  <Chip icon="content-cut" compact style={{ marginVertical: 2, alignSelf: 'flex-start' }}>
                    {chosenStylist.specialty}
                  </Chip>
                </View>
                {isChosenStylistBusy ? (
                  <Chip
                    icon="clock-alert-outline"
                    compact
                    style={{ backgroundColor: '#FFEBEE' }}
                    textStyle={{ color: '#D32F2F', fontWeight: 'bold', fontSize: 11 }}
                  >
                    Busy at this time
                  </Chip>
                ) : (
                  <Chip icon="check" compact style={{ backgroundColor: theme.colors.primaryContainer }}>
                    Assigned
                  </Chip>
                )}
              </View>
            )}
          </Card.Content>
        </Card>
        {isChosenStylistBusy && (
          <HelperText type="error" visible style={{ marginTop: -8 }}>
            ⚠️ This stylist is busy at {selectedTimeSlot} on {selectedBookingDate}. Please choose another stylist or time slot.
          </HelperText>
        )}

        {/* Appointment Date */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Appointment Date:
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          {upcomingDates.map((d) => (
            <Chip
              key={d.value}
              mode={selectedBookingDate === d.value ? 'flat' : 'outlined'}
              selected={selectedBookingDate === d.value}
              onPress={() => setValue('bookingDate', d.value)}
              style={{ marginRight: 8 }}
            >
              {d.label}
            </Chip>
          ))}
          {(() => {
            const isCustom = selectedBookingDate !== upcomingDates[0]?.value && selectedBookingDate !== upcomingDates[1]?.value;
            return (
              <Chip
                icon="calendar"
                mode={isCustom ? 'flat' : 'outlined'}
                selected={isCustom}
                onPress={() => setOpenDatePicker(true)}
                style={{ marginRight: 8 }}
              >
                {isCustom ? `Date: ${selectedBookingDate}` : 'Custom Date'}
              </Chip>
            );
          })()}
        </ScrollView>

        <DatePickerModal
          locale="en"
          mode="single"
          visible={openDatePicker}
          onDismiss={() => setOpenDatePicker(false)}
          date={new Date(selectedBookingDate)}
          validRange={{ startDate: new Date() }}
          onConfirm={(params) => {
            setOpenDatePicker(false);
            if (params.date) {
              const yyyy = params.date.getFullYear();
              const mm = String(params.date.getMonth() + 1).padStart(2, '0');
              const dd = String(params.date.getDate()).padStart(2, '0');
              setValue('bookingDate', `${yyyy}-${mm}-${dd}`);
            }
          }}
        />

        {/* Time Slot Selection */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Select Time Slot:
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {timeSlotsList.map((slot) => {
            const disabled = isSlotInPast(selectedBookingDate, slot);
            const isSelected = selectedTimeSlot === slot;
            return (
              <Chip
                key={slot}
                mode={isSelected ? 'flat' : 'outlined'}
                selected={selectedTimeSlot === slot}
                disabled={disabled}
                onPress={() => !disabled && setValue('timeSlot', slot)}
                showSelectedCheck={false}
                style={[
                  { marginRight: 8 },
                  disabled && { opacity: 0.4, backgroundColor: theme.colors.surfaceDisabled },
                ]}
              >
                {slot} {disabled ? '(Passed)' : ''}
              </Chip>
            );
          })}
        </ScrollView>

        {/* Receptionist Notes */}
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Receptionist Notes / Requests"
              mode="outlined"
              multiline
              numberOfLines={3}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              style={styles.input}
            />
          )}
        />

        <Button
          mode="contained"
          icon="calendar-plus"
          onPress={handleSubmit(onSubmit)}
          loading={createMutation.isPending}
          disabled={createMutation.isPending || isChosenStylistBusy}
          style={styles.submitBtn}
          contentStyle={{ paddingVertical: 6 }}
        >
          {isChosenStylistBusy ? 'Stylist Busy - Select Another' : `Create Walk-in Booking ($${totalPrice})`}
        </Button>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
      >
        Walk-in appointment created successfully!
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  badgeRow: {
    marginBottom: 12,
  },
  input: {
    marginTop: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  summaryBox: {
    borderRadius: 12,
    marginBottom: 8,
    borderColor: '#E0E0E0',
    backgroundColor: '#FBF8FD',
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 8,
    paddingTop: 8,
  },
  submitBtn: {
    marginTop: 24,
    borderRadius: 8,
  },
});
