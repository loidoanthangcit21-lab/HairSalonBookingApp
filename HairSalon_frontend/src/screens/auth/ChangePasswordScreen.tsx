import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Button,
  HelperText,
  Snackbar,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { userService } from '../../services/userService';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(4, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmNewPassword: z.string().min(6, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords don't match",
    path: ['confirmNewPassword'],
  });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export const ChangePasswordScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const changeMutation = useMutation({
    mutationFn: (values: ChangePasswordValues) =>
      userService.changePassword(values.currentPassword, values.newPassword),
    onSuccess: () => {
      setSnackbarVisible(true);
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    },
  });

  const onSubmit = (values: ChangePasswordValues) => {
    changeMutation.mutate(values);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Security & Password" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        <Controller
          control={control}
          name="currentPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Current Password"
              mode="outlined"
              secureTextEntry={!showCurrent}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showCurrent ? 'eye-off' : 'eye'}
                  onPress={() => setShowCurrent(!showCurrent)}
                />
              }
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.currentPassword}
              style={styles.input}
            />
          )}
        />
        {errors.currentPassword && (
          <HelperText type="error">{errors.currentPassword.message}</HelperText>
        )}

        <Controller
          control={control}
          name="newPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="New Password"
              mode="outlined"
              secureTextEntry={!showNew}
              left={<TextInput.Icon icon="key" />}
              right={
                <TextInput.Icon
                  icon={showNew ? 'eye-off' : 'eye'}
                  onPress={() => setShowNew(!showNew)}
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
          name="confirmNewPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Confirm New Password"
              mode="outlined"
              secureTextEntry={!showConfirm}
              left={<TextInput.Icon icon="key-change" />}
              right={
                <TextInput.Icon
                  icon={showConfirm ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirm(!showConfirm)}
                />
              }
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.confirmNewPassword}
              style={styles.input}
            />
          )}
        />
        {errors.confirmNewPassword && (
          <HelperText type="error">{errors.confirmNewPassword.message}</HelperText>
        )}

        <Button
          mode="contained"
          icon="key-change"
          onPress={handleSubmit(onSubmit)}
          loading={changeMutation.isPending}
          disabled={changeMutation.isPending}
          style={styles.submitBtn}
          contentStyle={{ paddingVertical: 6 }}
        >
          Update Password
        </Button>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
      >
        Password changed successfully!
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  input: {
    marginTop: 8,
  },
  submitBtn: {
    marginTop: 24,
    borderRadius: 8,
  },
});
