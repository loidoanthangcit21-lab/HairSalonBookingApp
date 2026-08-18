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
import { storage } from '../../utils/storage';
import { useAppDispatch } from '../../store';
import { setCredentials } from '../../store/authSlice';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID',
});

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'Full Name is required'),
    lastName: z.string().min(2, 'Full Name is required'),
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
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const dispatch = useAppDispatch();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const registerMutation = useMutation({
    mutationFn: (values: RegisterFormValues) =>
      authService.register({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        password: values.password,
      }),
    onSuccess: (data, variables) => {
      setSnackbarMessage('Account registered successfully! Redirecting to OTP Verification...');
      setSnackbarVisible(true);
      setTimeout(() => {
        navigation.navigate('OTPVerification', { email: variables.email, purpose: 'register' });
      }, 500);
    },
    onError: (error: any) => {
      setSnackbarMessage(error.message || 'Registration failed. Please try again.');
      setSnackbarVisible(true);
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate(values);
  };

  const googleLoginMutation = useMutation({
    mutationFn: (idToken: string) => authService.googleLogin(idToken),
    onSuccess: async (data) => {
      await storage.setToken(data.token);
      await storage.setUser(data.user);
      dispatch(setCredentials(data));
    },
    onError: (error: any) => {
      setSnackbarMessage(error.message || 'Google Sign-In failed.');
      setSnackbarVisible(true);
    },
  });

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      if (userInfo.type === 'success' && userInfo.data.idToken) {
        googleLoginMutation.mutate(userInfo.data.idToken);
      }
    } catch (error: any) {
      console.log('Google Sign-In Error:', error);
    }
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
          name="firstName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="First name"
              mode="outlined"
              left={<TextInput.Icon icon="account" />}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.firstName}
            />
          )}
        />
        {errors.firstName && (
          <HelperText type="error">{errors.firstName.message}</HelperText>
        )}

        <Controller
          control={control}
          name="lastName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Last Name"
              mode="outlined"
              left={<TextInput.Icon icon="account" />}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.lastName}
              style={styles.input}
            />
          )}
        />
        {errors.lastName && (
          <HelperText type="error">{errors.lastName.message}</HelperText>
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
          disabled={registerMutation.isPending || googleLoginMutation.isPending}
          style={styles.submitBtn}
          contentStyle={{ paddingVertical: 6 }}
        >
          Create Account
        </Button>

        <Button
          mode="outlined"
          icon="google"
          onPress={handleGoogleLogin}
          loading={googleLoginMutation.isPending}
          disabled={registerMutation.isPending || googleLoginMutation.isPending}
          style={styles.googleBtn}
          contentStyle={{ paddingVertical: 6 }}
        >
          Sign up with Google
        </Button>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
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
  googleBtn: {
    marginTop: 12,
    borderRadius: 8,
    borderColor: '#DB4437',
  },
});
