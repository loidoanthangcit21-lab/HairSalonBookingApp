import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  Appbar,
  Button,
  Card,
  Chip,
  Icon,
  Searchbar,
  Text,
  useTheme,
} from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../../services/bookingService';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { EmptyState } from '../../components/EmptyState';
import { ServiceItem, Stylist } from '../../types/service';

export const ExploreScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const [exploreType, setExploreType] = useState<'services' | 'stylists'>('services');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: services, isLoading: loadingServices, refetch: refetchServices } = useQuery({
    queryKey: ['services'],
    queryFn: () => bookingService.getServices(),
  });

  const { data: stylists, isLoading: loadingStylists, refetch: refetchStylists } = useQuery({
    queryKey: ['stylists'],
    queryFn: () => bookingService.getStylists(),
  });

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'cat_1', name: 'Haircuts' },
    { id: 'cat_2', name: 'Styling' },
    { id: 'cat_3', name: 'Coloring' },
    { id: 'cat_4', name: 'Treatment' },
  ];

  const filteredServices = (services || []).filter((s) => {
    const matchesCategory =
      selectedCategory === 'all' || s.categoryId === selectedCategory;
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredStylists = (stylists || []).filter((st) =>
    st.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    st.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLoading = loadingServices || loadingStylists;

  if (isLoading) {
    return <LoadingOverlay message="Loading salon catalog..." />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction
          onPress={() => navigation.navigate('CustomerMainTabs', { screen: 'HomeTab' })}
        />
        <Appbar.Content title="Explore Salon" />
      </Appbar.Header>

      <View style={styles.headerControls}>
        <Searchbar
          placeholder={exploreType === 'services' ? 'Search services...' : 'Search master stylists...'}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        {/* Toggle sub-tab row */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              exploreType === 'services' && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setExploreType('services')}
          >
            <Icon
              source="scissors-cutting"
              size={18}
              color={exploreType === 'services' ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
            />
            <Text
              variant="labelLarge"
              style={[
                styles.toggleText,
                { color: exploreType === 'services' ? theme.colors.onPrimary : theme.colors.onSurfaceVariant },
              ]}
            >
              Services
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              exploreType === 'stylists' && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setExploreType('stylists')}
          >
            <Icon
              source="account-group"
              size={18}
              color={exploreType === 'stylists' ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
            />
            <Text
              variant="labelLarge"
              style={[
                styles.toggleText,
                { color: exploreType === 'stylists' ? theme.colors.onPrimary : theme.colors.onSurfaceVariant },
              ]}
            >
              Master Stylists
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Chips for Services */}
        {exploreType === 'services' && (
          <FlatList
            horizontal
            data={categories}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
            renderItem={({ item }) => (
              <Chip
                mode={selectedCategory === item.id ? 'flat' : 'outlined'}
                selected={selectedCategory === item.id}
                onPress={() => setSelectedCategory(item.id)}
                style={styles.chip}
              >
                {item.name}
              </Chip>
            )}
          />
        )}
      </View>

      {/* Content area: Services or Stylists */}
      {exploreType === 'services' ? (
        <FlatList
          key="services_list"
          data={filteredServices}
          keyExtractor={(item) => item.id}
          refreshing={loadingServices}
          onRefresh={refetchServices}
          contentContainerStyle={
            filteredServices.length === 0 ? styles.emptyList : styles.list
          }
          ListEmptyComponent={
            <EmptyState
              icon="scissors-cutting"
              title="No Services Found"
              description="Try adjusting your search keywords or category filter."
            />
          }
          renderItem={({ item }: { item: ServiceItem }) => (
            <Card
              mode="outlined"
              style={styles.card}
              onPress={() => navigation.navigate('ServiceDetail', { serviceId: item.id, service: item })}
            >
              <Card.Cover source={{ uri: item.imageUrl }} style={styles.cardCover} />
              <Card.Content style={styles.cardContent}>
                <View style={{ flex: 1 }}>
                  <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                    {item.title}
                  </Text>
                  <Text variant="bodySmall" numberOfLines={2} style={{ opacity: 0.7, marginVertical: 4 }}>
                    {item.description}
                  </Text>

                  <View style={styles.metaRow}>
                    <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                      ${item.price}
                    </Text>
                  </View>
                </View>

                <Button
                  mode="contained"
                  compact
                  icon="calendar-check"
                  onPress={() => navigation.navigate('BookAppointment', { selectedServiceId: item.id })}
                  style={{ marginLeft: 8, borderRadius: 8, alignSelf: 'flex-end' }}
                >
                  Book Now
                </Button>
              </Card.Content>
            </Card>
          )}
        />
      ) : (
        <FlatList
          key="stylists_grid"
          data={filteredStylists}
          keyExtractor={(item) => item.id}
          numColumns={2}
          refreshing={loadingStylists}
          onRefresh={refetchStylists}
          contentContainerStyle={
            filteredStylists.length === 0 ? styles.emptyList : styles.gridList
          }
          ListEmptyComponent={
            <EmptyState
              icon="account-search-outline"
              title="No Stylists Found"
              description="Try searching with a different stylist name or specialty."
            />
          }
          renderItem={({ item }: { item: Stylist }) => (
            <View style={styles.gridItem}>
              <Card
                mode="outlined"
                style={styles.gridCard}
                onPress={() => navigation.navigate('StylistProfileDetail', { stylist: item })}
              >
                <Card.Cover source={{ uri: item.avatarUrl }} style={styles.gridCardCover} />
                <Card.Content style={{ padding: 12 }}>
                  <Text variant="titleSmall" numberOfLines={1} style={{ fontWeight: 'bold' }}>
                    {item.fullName}
                  </Text>

                  <Chip
                    icon="content-cut"
                    compact
                    style={{ marginVertical: 6, alignSelf: 'flex-start', maxWidth: '100%' }}
                    ellipsizeMode="tail"
                  >
                    <Text variant="labelMedium" numberOfLines={1} style={{ maxWidth: 100 }}>
                      {item.specialty}
                    </Text>
                  </Chip>
                </Card.Content>
              </Card>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerControls: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchbar: {
    marginBottom: 12,
    borderRadius: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F3EDF7',
    borderRadius: 24,
    padding: 4,
    marginBottom: 12,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  toggleText: {
    fontWeight: 'bold',
  },
  categoryRow: {
    paddingBottom: 4,
  },
  chip: {
    marginRight: 8,
  },
  list: {
    padding: 16,
    gap: 16,
  },
  gridList: {
    padding: 8,
  },
  gridItem: {
    flex: 0.5,
    padding: 8,
  },
  gridCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  gridCardCover: {
    height: 140,
  },
  emptyList: {
    flexGrow: 1,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardCover: {
    height: 140,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
});
