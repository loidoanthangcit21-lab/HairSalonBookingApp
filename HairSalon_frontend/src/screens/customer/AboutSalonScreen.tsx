import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Button,
  Card,
  Icon,
  List,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';

export const AboutSalonScreen = ({ navigation }: any) => {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="About Our Salon" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        <Card mode="contained" style={styles.heroCard}>
          <Card.Cover
            source={{
              uri:
                'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600',
            }}
            style={styles.heroCover}
          />
        </Card>

        <View style={styles.section}>
          <Text variant="headlineSmall" style={styles.title}>
            Modern Grooming & Hair Care Salon
          </Text>
          <Text variant="bodyMedium" style={styles.description}>
            We deliver premium hair styling, razor shaves, texture perms, and coloring treatments for gentlemen and ladies. Our certified stylists are dedicated to elevating your confidence with master craftsmanship.
          </Text>
        </View>

        {/* Static Map Placeholder Container */}
        <Surface style={styles.mapContainer} elevation={2}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon source="map-marker-radius" size={22} color={theme.colors.primary} />
            <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
              Interactive Salon Map Location
            </Text>
          </View>
          <Text variant="bodySmall" style={{ opacity: 0.7, marginTop: 4 }}>
            District 1 Headquarters • 123 Main Street, Ho Chi Minh City
          </Text>
        </Surface>

        <List.Section>
          <List.Subheader>Salon Contact & Operating Hours</List.Subheader>
          <List.Item
            title="Address"
            description="123 Main Street, District 1, HCMC"
            left={(p) => <List.Icon {...p} icon="map-marker" />}
          />
          <List.Item
            title="Opening Hours"
            description="Mon - Sun: 08:30 AM - 08:30 PM"
            left={(p) => <List.Icon {...p} icon="clock-outline" />}
          />
          <List.Item
            title="Hotline Support"
            description="+84 901 234 567"
            left={(p) => <List.Icon {...p} icon="phone" />}
          />
        </List.Section>

        <View style={styles.btnRow}>
          <Button
            mode="contained-tonal"
            icon="phone"
            style={{ flex: 1 }}
            onPress={() => {}}
          >
            Call Now
          </Button>
          <Button
            mode="contained"
            icon="directions"
            style={{ flex: 1 }}
            onPress={() => {}}
          >
            Get Directions
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  heroCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  heroCover: {
    height: 180,
  },
  section: {
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    lineHeight: 22,
    opacity: 0.8,
  },
  mapContainer: {
    height: 140,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    marginVertical: 12,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 24,
  },
});
