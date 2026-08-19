import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Appbar, Avatar, Button, Card, Chip, Searchbar, Surface, Text, useTheme } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../../services/bookingService';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { EmptyState } from '../../components/EmptyState';
import { Stylist } from '../../types/service';
import { BookingStatus } from '../../constants/bookingStatus';

export const BrowseStylistsScreen = ({ navigation, route }: any) => {
  const theme = useTheme();

  const isSelectionMode = route?.params?.isSelectionMode || false;
  const initialSelectedId: string = route?.params?.selectedStylistId || 'usr_stylist_1';
  const returnScreen = route?.params?.returnScreen;
  const selectedDate = route?.params?.selectedDate;
  const selectedTimeSlot = route?.params?.selectedTimeSlot;

  const [selectedId, setSelectedId] = useState<string>(initialSelectedId);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: stylists, isLoading, refetch } = useQuery({
    queryKey: ['stylists'],
    queryFn: () => bookingService.getStylists(),
  });

  const { data: fetchedCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => bookingService.getCategories(),
  });

  const categories = [
    { id: 'all', name: 'All' },
    ...(fetchedCategories || []),
  ];

  const { data: allBookings } = useQuery({
    queryKey: ['myBookings'],
    queryFn: () => bookingService.getMyBookings(),
  });

  const isStylistBusy = (stylistId: string): boolean => {
    if (!selectedDate || !selectedTimeSlot || !allBookings) return false;
    return allBookings.some(
      (b) =>
        (b.status === BookingStatus.PENDING || b.status === BookingStatus.CONFIRMED) &&
        (b.stylistId === stylistId ||
          b.stylistName?.toLowerCase()?.includes(stylistId.toLowerCase()) ||
          stylistId.toLowerCase().includes(b.stylistName?.toLowerCase() || '')) &&
        b.bookingDate === selectedDate &&
        b.timeSlot === selectedTimeSlot
    );
  };

  const filteredStylists = (stylists || []).filter((st) => {
    const matchesSearch = st.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const selectedCategoryObj = (fetchedCategories || []).find((c) => c.id === selectedCategory);
    const targetCatName = selectedCategoryObj ? selectedCategoryObj.name.toLowerCase() : selectedCategory.toLowerCase();

    const matchesCategory =
      selectedCategory === 'all' ||
      (st.categories &&
        st.categories.some(
          (c) =>
            c.id === selectedCategory ||
            c.name.toLowerCase() === targetCatName ||
            c.name.toLowerCase() === selectedCategory.toLowerCase()
        ));
    return matchesSearch && matchesCategory;
  });


  const selectedStylist = (stylists || []).find((st) => st.id === selectedId);

  const handleApplySelection = () => {
    if (route?.params?.onSelectStylist) {
      route.params.onSelectStylist(selectedId);
    }
    if (returnScreen) {
      navigation.navigate(returnScreen, { selectedStylistId: selectedId });
    } else {
      navigation.goBack();
    }
  };

  if (isLoading) {
    return <LoadingOverlay message="Loading stylists..." />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={isSelectionMode ? 'Select Master Stylist' : 'Our Master Stylists'} />
      </Appbar.Header>

      <View style={styles.headerControls}>
        <Searchbar
          placeholder="Search stylists by name..."
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
        key={isSelectionMode ? 'selection_mode_list' : 'catalog_mode_grid'}
        data={filteredStylists}
        keyExtractor={(item) => item.id}
        numColumns={isSelectionMode ? 1 : 2}
        refreshing={isLoading}
        onRefresh={refetch}
        contentContainerStyle={[
          styles.list,
          isSelectionMode && { padding: 16, paddingBottom: 100 },
        ]}
        ListEmptyComponent={
          <EmptyState
            icon="account-search"
            title="No Stylists Found"
            description="Try adjusting your search name or category filter."
          />
        }
        renderItem={({ item }: { item: Stylist }) => {


          const isSelected = selectedId === item.id;
          const isBusy = isStylistBusy(item.id);

          if (isSelectionMode) {
            return (
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={isBusy}
                onPress={() => !isBusy && setSelectedId(item.id)}
                style={[
                  styles.selectionCard,
                  isBusy && { opacity: 0.5, backgroundColor: '#F5F5F5' },
                  isSelected && {
                    borderColor: theme.colors.primary,
                    borderWidth: 2,
                    backgroundColor: theme.colors.primaryContainer + '20',
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', padding: 12, alignItems: 'center' }}>
                  <Avatar.Image size={54} source={{ uri: item.avatarUrl }} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text
                      variant="titleMedium"
                      style={{
                        fontWeight: 'bold',
                        color: isBusy ? '#757575' : theme.colors.onSurface,
                      }}
                    >
                      {item.fullName}
                    </Text>
                    <View style={{ flexDirection: 'row', marginTop: 4 }}>
                      <Chip
                        icon="content-cut"
                        compact
                        style={{ flexShrink: 1, maxWidth: '100%' }}
                      >
                        <Text variant="labelSmall" numberOfLines={1} style={{ flexShrink: 1 }}>
                          {item.specialty || 'Master Stylist'}
                        </Text>
                      </Chip>
                    </View>
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
                      {isSelected ? '✓ Selected' : 'Select'}
                    </Chip>
                  )}
                </View>
              </TouchableOpacity>
            );
          }

          return (
            <View style={styles.gridItem}>
              <Card
                mode="outlined"
                style={styles.card}
                onPress={() => navigation.navigate('StylistProfileDetail', { stylist: item })}
              >
                <Card.Cover source={{ uri: item.avatarUrl }} style={styles.cardCover} />
                <Card.Content style={{ padding: 12 }}>
                  <Text variant="titleSmall" style={styles.name} numberOfLines={1}>
                    {item.fullName}
                  </Text>
                  <View style={{ flexDirection: 'row', marginTop: 4 }}>
                    <Chip
                      icon="content-cut"
                      compact
                      style={{ flexShrink: 1, maxWidth: '100%' }}
                    >
                      <Text variant="labelSmall" numberOfLines={1} style={{ flexShrink: 1 }}>
                        {item.specialty || 'Master Stylist'}
                      </Text>
                    </Chip>
                  </View>
                </Card.Content>
              </Card>

            </View>
          );
        }}
      />

      {isSelectionMode && (
        <Surface elevation={3} style={styles.bottomBar}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text variant="labelSmall" style={{ opacity: 0.6 }}>Assigned Stylist</Text>
            <Text variant="titleMedium" numberOfLines={1} style={{ fontWeight: 'bold', color: theme.colors.primary }}>
              {selectedStylist ? selectedStylist.fullName : 'None'}
            </Text>
          </View>
          <Button
            mode="contained"
            icon="check-circle"
            onPress={handleApplySelection}
            style={{ borderRadius: 24, paddingHorizontal: 16 }}
          >
            CONFIRM STYLIST
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
    padding: 8,
  },
  gridItem: {
    flex: 0.5,
    padding: 8,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  selectionCard: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  cardCover: {
    height: 140,
  },
  name: {
    fontWeight: 'bold',
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

