import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Button,
  Card,
  Chip,
  List,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../../services/userService';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../store/authSlice';
import { storage } from '../../utils/storage';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { ROLE_LABELS } from '../../constants/roles';

export const ViewProfileScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const reduxUser = useAppSelector((state) => state.auth.user);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => userService.getProfile(),
  });

  const activeProfile = profile || reduxUser;

  const handleLogout = async () => {
    await storage.clearAll();
    dispatch(logout());
  };

  if (isLoading) {
    return <LoadingOverlay message="Loading profile..." />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.Content title="My Profile" />
        <Appbar.Action
          icon="cog-outline"
          onPress={() => navigation.navigate('Settings')}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        <Surface style={styles.headerSurface} elevation={2}>
          <Text variant="headlineSmall" style={styles.name}>
            {activeProfile?.fullName || 'User Name'}
          </Text>
          <Chip
            icon="shield-account"
            style={{ marginTop: 8 }}
            compact
          >
            {activeProfile?.role ? ROLE_LABELS[activeProfile.role] : 'Customer'}
          </Chip>
        </Surface>

        <Card mode="outlined" style={styles.card}>
          <Card.Content style={{ paddingHorizontal: 0 }}>
            <List.Item
              title="Email Address"
              description={activeProfile?.email || 'N/A'}
              left={(props) => <List.Icon {...props} icon="email" />}
            />
            <List.Item
              title="Phone Number"
              description={activeProfile?.phone || 'N/A'}
              left={(props) => <List.Icon {...props} icon="phone" />}
            />
            <List.Item
              title="Address"
              description={activeProfile?.address || 'Not specified'}
              left={(props) => <List.Icon {...props} icon="map-marker" />}
            />
          </Card.Content>
        </Card>

        <View style={styles.actionSection}>
          <Button
            mode="outlined"
            icon="account-edit"
            onPress={() => navigation.navigate('UpdateProfile')}
            style={styles.button}
          >
            Edit Profile
          </Button>

          <Button
            mode="outlined"
            icon="lock-reset"
            onPress={() => navigation.navigate('ChangePassword')}
            style={styles.button}
          >
            Change Password
          </Button>

          <Button
            mode="contained"
            buttonColor={theme.colors.error}
            icon="logout"
            onPress={handleLogout}
            style={[styles.button, { marginTop: 12 }]}
          >
            Logout
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
  headerSurface: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 16,
    marginBottom: 16,
  },
  name: {
    fontWeight: 'bold',
    marginTop: 12,
  },
  card: {
    marginBottom: 20,
    borderRadius: 12,
  },
  actionSection: {
    gap: 10,
  },
  button: {
    borderRadius: 8,
  },
});
