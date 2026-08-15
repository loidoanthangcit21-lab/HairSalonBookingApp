import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Button,
  HelperText,
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

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Full Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const registerMutation = useMutation({
    mutationFn: (values: RegisterFormValues) =>
      authService.register({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        password: values.password,
      }),
    onSuccess: () => {
      setSnackbarVisible(true);
      setTimeout(() => {
        navigation.navigate('Login');
      }, 1500);
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate(values);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Create Account" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="headlineSmall" style={styles.title}>
          Join Hair Salon App
        </Text>
        <Text variant="bodyMedium" style={{ marginBottom: 20, opacity: 0.7 }}>
          Create an account to book haircuts, choose stylists & track appointments.
        </Text>

        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Full Name"
              mode="outlined"
              left={<TextInput.Icon icon="account" />}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.fullName}
            />
          )}
        />
        {errors.fullName && (
          <HelperText type="error">{errors.fullName.message}</HelperText>
        )}

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Email Address"
              mode="outlined"
              keyboardType="email-address"
              left={<TextInput.Icon icon="email" />}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.email}
              style={styles.input}
            />
          )}
        />
        {errors.email && (
          <HelperText type="error">{errors.email.message}</HelperText>
        )}

        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Phone Number"
              mode="outlined"
              keyboardType="phone-pad"
              left={<TextInput.Icon icon="phone" />}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.phone}
              style={styles.input}
            />
          )}
        />
        {errors.phone && (
          <HelperText type="error">{errors.phone.message}</HelperText>
        )}

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Password"
              mode="outlined"
              secureTextEntry
              left={<TextInput.Icon icon="lock" />}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.password}
              style={styles.input}
            />
          )}
        />
        {errors.password && (
          <HelperText type="error">{errors.password.message}</HelperText>
        )}

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Confirm Password"
              mode="outlined"
              secureTextEntry
              left={<TextInput.Icon icon="lock-check" />}
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

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={registerMutation.isPending}
          disabled={registerMutation.isPending}
          style={styles.submitBtn}
          contentStyle={{ paddingVertical: 6 }}
        >
          Create Account
        </Button>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        Account registered successfully! Redirecting to Sign In...
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
  submitBtn: {
    marginTop: 20,
    borderRadius: 8,
  },
});
