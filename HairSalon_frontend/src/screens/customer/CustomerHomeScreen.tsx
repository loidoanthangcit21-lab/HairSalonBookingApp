import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  Appbar,
  Button,
  Card,
  Chip,
  Icon,
  Text,
  useTheme,
} from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../../services/bookingService';
import { useAppSelector } from '../../store';

export const CustomerHomeScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const user = useAppSelector((state) => state.auth.user);

  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: () => bookingService.getServices(),
  });

  const { data: stylists } = useQuery({
    queryKey: ['stylists'],
    queryFn: () => bookingService.getStylists(),
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.Content
          title={`Hello, ${user?.fullName ? user.fullName.split(' ')[0] : 'Alex'}!`}
          subtitle="Ready for a fresh new look?"
        />
        <Appbar.Action
          icon="bell-outline"
          onPress={() => navigation.navigate('NotificationPanel')}
        />
        <Appbar.Action
          icon="information-outline"
          onPress={() => navigation.navigate('AboutSalon')}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Hero Banner Section */}
        <Card mode="contained" style={styles.heroCard}>
          <Card.Content style={styles.heroContent}>
            <Text variant="headlineSmall" style={styles.heroTitle}>
              Need a Haircut?
            </Text>
            <Text variant="bodyMedium" style={styles.heroSubtitle}>
              Book top master stylists in town with zero wait time.
            </Text>
            <Button
              mode="contained"
              icon="calendar-check"
              buttonColor={theme.colors.primary}
              textColor={theme.colors.onPrimary}
              style={styles.heroButton}
              onPress={() => navigation.navigate('BookAppointment')}
            >
              BOOK APPOINTMENT NOW
            </Button>
          </Card.Content>
        </Card>

        {/* Popular Services Section Header with See All */}
        <View style={styles.sectionHeaderRow}>
          <Text variant="titleMedium" style={styles.sectionHeader}>
            Our Services
          </Text>
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() => navigation.navigate('BrowseServices')}
          >
            <Text variant="labelLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
              See All
            </Text>
            <Icon source="arrow-right" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promoRow}>
          {(services || []).map((srv) => (
            <Card
              key={srv.id}
              mode="outlined"
              style={styles.promoCard}
              onPress={() => navigation.navigate('ServiceDetail', { serviceId: srv.id, service: srv })}
            >
              <Card.Cover source={{ uri: srv.imageUrl }} style={styles.cardImage} />
              <Card.Content style={{ padding: 12 }}>
                <Text variant="titleSmall" numberOfLines={1} style={{ fontWeight: 'bold' }}>
                  {srv.title}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.primary, fontWeight: 'bold', marginTop: 4 }}>
                  ${srv.price}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>

        {/* Top Master Stylists Section Header with See All */}
        <View style={[styles.sectionHeaderRow, { marginTop: 16 }]}>
          <Text variant="titleMedium" style={styles.sectionHeader}>
            Our Stylists
          </Text>
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() => navigation.navigate('BrowseStylists')}
          >
            <Text variant="labelLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
              See All
            </Text>
            <Icon source="arrow-right" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promoRow}>
          {(stylists || []).map((st) => (
            <Card
              key={st.id}
              mode="outlined"
              style={styles.promoCard}
              onPress={() => navigation.navigate('StylistProfileDetail', { stylist: st })}
            >
              <Card.Cover source={{ uri: st.avatarUrl }} style={styles.cardImage} />
              <Card.Content style={{ padding: 12 }}>
                <Text variant="titleSmall" numberOfLines={1} style={{ fontWeight: 'bold' }}>
                  {st.fullName}
                </Text>
                <Chip
                  icon="content-cut"
                  compact
                  style={{ marginVertical: 4, alignSelf: 'flex-start', maxWidth: '100%' }}
                  ellipsizeMode="tail"
                >
                  <Text variant="labelMedium" numberOfLines={1} style={{ maxWidth: 110 }}>
                    {st.specialty}
                  </Text>
                </Chip>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: '#1E1B2E',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  heroContent: {
    padding: 20,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  heroSubtitle: {
    color: '#D1CBDD',
    marginVertical: 8,
  },
  heroButton: {
    marginTop: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionHeader: {
    fontWeight: 'bold',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  promoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  promoCard: {
    width: 200,
    marginRight: 12,
    borderRadius: 12,
  },
  cardImage: {
    height: 120,
  },
});
