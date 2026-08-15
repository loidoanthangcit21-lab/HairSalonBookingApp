import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Button,
  Card,
  Chip,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../../services/bookingService';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { EmptyState } from '../../components/EmptyState';
import { Booking } from '../../types/booking';
import { BookingStatus } from '../../constants/bookingStatus';
import { useAppSelector } from '../../store';

export const StylistAssignedJobsScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const user = useAppSelector((state) => state.auth.user);

  const { data: jobs, isLoading, refetch } = useQuery({
    queryKey: ['stylistJobs'],
    queryFn: () => bookingService.getStylistJobs(),
  });

  const startServiceMutation = useMutation({
    mutationFn: (jobId: string) =>
      bookingService.updateBookingStatus(jobId, BookingStatus.CONFIRMED),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stylistJobs'] });
    },
  });

  const jobList = jobs || [];

  if (isLoading) {
    return <LoadingOverlay message="Fetching your assigned jobs for today..." />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.Content
          title={`Hello, ${user?.fullName ? user.fullName.split(' ')[0] : 'Stylist'}!`}
          subtitle="Your Haircuts & Styling Queue"
        />
        <Appbar.Action
          icon="account-circle-outline"
          onPress={() => navigation.navigate('ViewProfile')}
        />
      </Appbar.Header>

      <Surface style={styles.workloadBanner} elevation={1}>
        <View style={styles.workloadRow}>
          <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
            Daily Workload Queue
          </Text>
          <Chip icon="content-cut" style={{ backgroundColor: theme.colors.primaryContainer }}>
            {jobList.length} Jobs Today
          </Chip>
        </View>
      </Surface>

      <FlatList
        data={jobList}
        keyExtractor={(item) => item.id}
        refreshing={isLoading}
        onRefresh={refetch}
        contentContainerStyle={
          jobList.length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={
          <EmptyState
            icon="scissors-cutting"
            title="No Assigned Jobs Today"
            description="You currently have no scheduled haircut jobs assigned to your queue."
          />
        }
        renderItem={({ item }: { item: Booking }) => (
          <Card
            mode="outlined"
            style={styles.card}
            onPress={() => navigation.navigate('StylistJobDetail', { job: item })}
          >
            <Card.Title
              title={`${item.timeSlot} — ${item.customerName}`}
              subtitle={`Phone: ${item.customerPhone}`}
              right={() => (
                <Chip compact style={{ marginRight: 16 }}>
                  {item.status.toUpperCase()}
                </Chip>
              )}
            />
            <Card.Content>
              <Chip
                icon="clock-outline"
                compact
                style={{
                  alignSelf: 'flex-start',
                  marginBottom: 8,
                  backgroundColor: theme.colors.secondaryContainer,
                }}
              >
                {item.bookingDate || 'Today'} • {item.timeSlot}
              </Chip>

              <Text variant="titleMedium" style={styles.serviceName}>
                Service: {item.services.map((s) => s.title).join(', ')}
              </Text>

              {item.notes ? (
                <Surface style={styles.notesBox} elevation={0}>
                  <Text variant="bodySmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                    Customer Request Notes:
                  </Text>
                  <Text variant="bodyMedium" style={{ marginTop: 2 }}>
                    "{item.notes}"
                  </Text>
                </Surface>
              ) : null}
            </Card.Content>

            <Card.Actions style={styles.actions}>
              <Button
                mode="contained"
                icon="play"
                loading={startServiceMutation.isPending}
                disabled={startServiceMutation.isPending}
                onPress={() => navigation.navigate('StylistJobDetail', { job: item })}
              >
                View Job & Start Service
              </Button>
            </Card.Actions>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  workloadBanner: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
  },
  workloadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  emptyList: {
    flexGrow: 1,
  },
  card: {
    borderRadius: 16,
  },
  serviceName: {
    fontWeight: 'bold',
    marginVertical: 4,
  },
  notesBox: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F0EFF5',
    marginTop: 8,
  },
  actions: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
});
