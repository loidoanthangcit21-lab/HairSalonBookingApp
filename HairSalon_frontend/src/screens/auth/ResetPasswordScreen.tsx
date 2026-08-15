import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Button,
  HelperText,
  List,
  Snackbar,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../../services/authService';

const resetSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetFormValues = z.infer<typeof resetSchema>;

export const ResetPasswordScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const passwordValue = watch('newPassword', '');

  const hasLength = passwordValue.length >= 8;
  const hasNumber = /\d/.test(passwordValue);

  const resetMutation = useMutation({
    mutationFn: (values: ResetFormValues) =>
      authService.resetPassword(values.newPassword),
    onSuccess: () => {
      setSnackbarVisible(true);
      setTimeout(() => {
        navigation.navigate('Login');
      }, 1500);
    },
  });

  const onSubmit = (values: ResetFormValues) => {
    resetMutation.mutate(values);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Set New Password" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="headlineSmall" style={styles.title}>
          Create New Password
        </Text>
        <Text variant="bodyMedium" style={{ marginBottom: 20, opacity: 0.7 }}>
          Your new password must be different from previous passwords.
        </Text>

        <Controller
          control={control}
          name="newPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="New Password"
              mode="outlined"
              secureTextEntry={!showPass}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showPass ? 'eye-off' : 'eye'}
                  onPress={() => setShowPass(!showPass)}
                />
              }
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.newPassword}
              style={styles.input}
            />
          )}
        />
        {errors.newPassword && (
          <HelperText type="error">{errors.newPassword.message}</HelperText>
        )}

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Confirm New Password"
              mode="outlined"
              secureTextEntry={!showConfirm}
              left={<TextInput.Icon icon="lock-check" />}
              right={
                <TextInput.Icon
                  icon={showConfirm ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirm(!showConfirm)}
                />
              }
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.confirmPassword}
              style={styles.input}
            />
          )}
        />
        {errors.confirmPassword && (
          <HelperText type="error">{errors.confirmPassword.message}</HelperText>
        )}

        <View style={styles.checklist}>
          <Text variant="labelLarge" style={{ marginBottom: 8 }}>
            Password Requirements:
          </Text>
          <List.Item
            title="At least 8 characters long"
            left={(props) => (
              <List.Icon
                {...props}
                icon={hasLength ? 'check-circle' : 'circle-outline'}
                color={hasLength ? theme.colors.primary : theme.colors.onSurfaceVariant}
              />
            )}
          />
          <List.Item
            title="Contains at least one number (0-9)"
            left={(props) => (
              <List.Icon
                {...props}
                icon={hasNumber ? 'check-circle' : 'circle-outline'}
                color={hasNumber ? theme.colors.primary : theme.colors.onSurfaceVariant}
              />
            )}
          />
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={resetMutation.isPending}
          disabled={resetMutation.isPending}
          style={styles.submitBtn}
          contentStyle={{ paddingVertical: 6 }}
        >
          Submit New Password
        </Button>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        Password updated successfully! Redirecting to Sign In...
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  input: {
    marginTop: 8,
  },
  checklist: {
    marginVertical: 16,
  },
  submitBtn: {
    marginTop: 16,
    borderRadius: 8,
  },
});
