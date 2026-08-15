import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Avatar,
  Button,
  Card,
  Chip,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';
import { MOCK_STYLISTS } from '../../mocks/mockServices';

export const StylistProfileDetailScreen = ({ navigation, route }: any) => {
  const theme = useTheme();
  const stylist = route?.params?.stylist || MOCK_STYLISTS[0];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Stylist Profile" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        <Surface style={styles.headerSurface} elevation={1}>
          <Avatar.Image size={100} source={{ uri: stylist.avatarUrl }} />
          <Text variant="headlineSmall" style={styles.name}>
            {stylist.fullName}
          </Text>
          <View style={styles.badgeRow}>
            <Chip icon="briefcase" style={styles.chip}>
              {stylist.experienceYears} Yrs Exp
            </Chip>
          </View>
        </Surface>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            About & Bio
          </Text>
          <Text variant="bodyMedium" style={styles.bioText}>
            {stylist.bio}
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Specialties & Skills
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Chip icon="content-cut">{stylist.specialty}</Chip>
            <Chip icon="scissors-cutting">Precision Fades</Chip>
            <Chip icon="hair-dryer">Beard Styling</Chip>
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Portfolio & Recent Cuts
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {stylist.portfolioImages.map((img: string, idx: number) => (
              <Card key={idx} mode="outlined" style={styles.portfolioCard}>
                <Card.Cover source={{ uri: img }} style={styles.portfolioCover} />
              </Card>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <Surface elevation={2} style={styles.bottomBar}>
        <Button
          mode="contained"
          icon="calendar-check"
          onPress={() =>
            navigation.navigate('BookAppointment', { selectedStylistId: stylist.id })
          }
          style={styles.selectBtn}
          contentStyle={{ paddingVertical: 6 }}
        >
          Select Stylist for Booking
        </Button>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 90,
  },
  headerSurface: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 16,
    marginBottom: 20,
  },
  name: {
    fontWeight: 'bold',
    marginTop: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  chip: {
    marginHorizontal: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bioText: {
    opacity: 0.8,
    lineHeight: 22,
  },
  portfolioCard: {
    width: 160,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  portfolioCover: {
    height: 160,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  selectBtn: {
    borderRadius: 8,
  },
});
