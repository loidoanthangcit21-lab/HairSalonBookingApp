import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Button,
  Card,
  Chip,
  Searchbar,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../../services/bookingService';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { EmptyState } from '../../components/EmptyState';
import { ServiceItem } from '../../types/service';

export const BrowseServicesScreen = ({ navigation, route }: any) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const isSelectionMode = route?.params?.isSelectionMode || false;
  const initialSelectedIds: string[] = route?.params?.selectedServiceIds || ['srv_1'];
  const returnScreen = route?.params?.returnScreen;

  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);

  const { data: services, isLoading, refetch } = useQuery({
    queryKey: ['services'],
    queryFn: () => bookingService.getServices(),
  });

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'cat_1', name: 'Haircuts' },
    { id: 'cat_2', name: 'Styling & Perm' },
    { id: 'cat_3', name: 'Coloring' },
    { id: 'cat_4', name: 'Spa & Care' },
  ];

  const toggleSelection = (serviceId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(serviceId)) {
        if (prev.length === 1) return prev; // Keep at least 1
        return prev.filter((id) => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  const chosenServices = (services || []).filter((s) => selectedIds.includes(s.id));
  const totalPrice = chosenServices.reduce((sum, s) => sum + s.price, 0);

  const filteredServices = (services || []).filter((s) => {
    const matchesCategory =
      selectedCategory === 'all' || s.categoryId === selectedCategory;
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleApplySelection = () => {
    if (route?.params?.onSelectServices) {
      route.params.onSelectServices(selectedIds);
    }
    if (returnScreen) {
      navigation.navigate(returnScreen, { selectedServiceIds: selectedIds });
    } else {
      navigation.goBack();
    }
  };

  if (isLoading) {
    return <LoadingOverlay message="Loading service catalog..." />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={isSelectionMode ? 'Select Services' : 'Our Services'} />
      </Appbar.Header>

      <View style={styles.headerControls}>
        <Searchbar
          placeholder="Search services..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item.id}
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
      </View>

      <FlatList
        data={filteredServices}
        keyExtractor={(item) => item.id}
        refreshing={isLoading}
        onRefresh={refetch}
        contentContainerStyle={[
          filteredServices.length === 0 ? styles.emptyList : styles.list,
          isSelectionMode && { paddingBottom: 100 },
        ]}
        ListEmptyComponent={
          <EmptyState
            icon="scissors-cutting"
            title="No Services Found"
            description="Try adjusting your search keywords or category filter."
          />
        }
        renderItem={({ item }: { item: ServiceItem }) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <Card
              mode="outlined"
              style={[
                styles.card,
                isSelectionMode && isSelected && {
                  borderColor: theme.colors.primary,
                  borderWidth: 2,
                  backgroundColor: theme.colors.primaryContainer + '15',
                },
              ]}
              onPress={() => {
                if (isSelectionMode) {
                  toggleSelection(item.id);
                } else {
                  navigation.navigate('ServiceDetail', { serviceId: item.id, service: item });
                }
              }}
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

                {isSelectionMode ? (
                  <Button
                    mode={isSelected ? 'contained' : 'outlined'}
                    compact
                    style={{ marginLeft: 8, borderRadius: 20, alignSelf: 'flex-end' }}
                    onPress={() => toggleSelection(item.id)}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </Button>
                ) : (
                  <Button
                    mode="contained"
                    compact
                    icon="calendar-check"
                    onPress={() => navigation.navigate('BookAppointment', { selectedServiceId: item.id })}
                    style={{ marginLeft: 8, borderRadius: 8, alignSelf: 'flex-end' }}
                  >
                    Book Now
                  </Button>
                )}
              </Card.Content>
            </Card>
          );
        }}
      />

      {isSelectionMode && (
        <Surface elevation={3} style={styles.bottomBar}>
          <View>
            <Text variant="labelSmall" style={{ opacity: 0.6 }}>
              {selectedIds.length} Service{selectedIds.length > 1 ? 's' : ''} Selected
            </Text>
            <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
              ${totalPrice}
            </Text>
          </View>
          <Button
            mode="contained"
            icon="check-circle"
            onPress={handleApplySelection}
            style={{ borderRadius: 24, paddingHorizontal: 16 }}
          >
            CONFIRM SELECTION
          </Button>
        </Surface>
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
  categoryRow: {
    paddingBottom: 4,
  },
  chip: {
    marginRight: 8,
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardCover: {
    height: 140,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
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
});
