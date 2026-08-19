import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Button, Text, useTheme } from 'react-native-paper';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'database-outline',
  title,
  description,
  actionLabel,
  onAction,
}) => {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <Avatar.Icon icon={icon} size={64} style={{ backgroundColor: theme.colors.surfaceVariant }} />
      <Text variant="titleMedium" style={styles.title}>
        {title}
      </Text>
      {description && (
        <Text variant="bodyMedium" style={styles.description}>
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button mode="contained" onPress={onAction} style={styles.button}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginTop: 16,
    fontWeight: 'bold',
  },
  description: {
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.7,
  },
  button: {
    marginTop: 20,
  },
});
