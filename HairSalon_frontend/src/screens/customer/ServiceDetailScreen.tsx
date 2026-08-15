import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Card,
  Chip,
  IconButton,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../store';
import { UserRole } from '../../constants/roles';

export const ServiceDetailScreen = ({ navigation, route }: any) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAppSelector((state) => state.auth.user);
  const service = route?.params?.service || {
    id: 'srv_1',
    title: 'Executive Gentleman Haircut',
    description:
      'Precision haircut, scalp wash, shoulder massage, and professional styling product application by master barbers.',
    durationMinutes: 45,
    price: 25,
    imageUrl:
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=400',
    categoryName: 'Haircut',
  };

  const isStaff = user?.role === UserRole.RECEPTIONIST || user?.role === UserRole.STYLIST;

  const topInset = insets.top > 0 ? insets.top + 8 : 16;
  const bottomPadding = insets.bottom > 0 ? insets.bottom + 12 : 16;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 80 + bottomPadding }]}>
        <View style={styles.imageContainer}>
          <Card.Cover source={{ uri: service.imageUrl }} style={styles.heroImage} />
          <IconButton
            icon="arrow-left"
            mode="contained"
            containerColor="rgba(0,0,0,0.5)"
            iconColor="#FFF"
            size={24}
            style={[styles.backBtn, { top: topInset }]}
            onPress={() => navigation.goBack()}
          />
        </View>

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text variant="headlineSmall" style={{ fontWeight: 'bold', flex: 1 }}>
              {service.title}
            </Text>
            <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
              ${service.price}
            </Text>
          </View>

          <View style={styles.badgeRow}>
            <Chip icon="tag" style={styles.chip}>
              {service.categoryName || 'General'}
            </Chip>
          </View>

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Description & Package Includes
          </Text>
          <Text variant="bodyLarge" style={styles.description}>
            {service.description}
          </Text>
        </View>
      </ScrollView>

      {/* Conditional Sticky Bottom Action Area */}
      <Surface elevation={2} style={[styles.bottomBar, { paddingBottom: bottomPadding }]}>
        {!isStaff ? (
          <Button
            mode="contained"
            icon="calendar"
            onPress={() =>
              navigation.navigate('BookAppointment', { selectedServiceId: service.id })
            }
            style={styles.bookBtn}
            contentStyle={{ paddingVertical: 6 }}
          >
            Book Now (${service.price})
          </Button>
        ) : (
          <View style={styles.staffBtnRow}>
            <Button
              mode="contained-tonal"
              icon="pencil"
              style={{ flex: 1 }}
              onPress={() => {}}
            >
              Edit Service
            </Button>
            <Button
              mode="contained"
              buttonColor={theme.colors.error}
              icon="delete"
              style={{ flex: 1 }}
              onPress={() => {}}
            >
              Delete
            </Button>
          </View>
        )}
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 80,
  },
  imageContainer: {
    position: 'relative',
  },
  heroImage: {
    height: 260,
    borderRadius: 0,
  },
  backBtn: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  content: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  chip: {
    marginRight: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    opacity: 0.8,
    lineHeight: 24,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  bookBtn: {
    borderRadius: 8,
  },
  staffBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
