import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, List, Switch, useTheme } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../store';
import { toggleDarkMode } from '../../store/themeSlice';
import { storage } from '../../utils/storage';

export const SettingsScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.theme.isDarkMode);

  const handleToggleTheme = async () => {
    const nextState = !isDarkMode;
    dispatch(toggleDarkMode());
    await storage.setTheme(nextState);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="App Settings" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        <List.Section>
          <List.Subheader>Appearance & Theme</List.Subheader>
          <List.Item
            title="Dark Theme"
            description="Toggle light/dark mode locally"
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch value={isDarkMode} onValueChange={handleToggleTheme} />
            )}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>General Preferences</List.Subheader>
          <List.Item
            title="Language"
            description="English / Tiếng Việt"
            left={(props) => <List.Icon {...props} icon="translate" />}
            onPress={() => {}}
          />
          <List.Item
            title="Privacy Policy"
            description="Read our data privacy rules"
            left={(props) => <List.Icon {...props} icon="shield-lock-outline" />}
            onPress={() => {}}
          />
          <List.Item
            title="Terms of Service"
            description="Salon rules & user agreements"
            left={(props) => <List.Icon {...props} icon="file-document-outline" />}
            onPress={() => {}}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>System Information</List.Subheader>
          <List.Item
            title="App Version"
            description="v1.0.0 (Build 2026.1)"
            left={(props) => <List.Icon {...props} icon="information-outline" />}
          />
        </List.Section>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
});
