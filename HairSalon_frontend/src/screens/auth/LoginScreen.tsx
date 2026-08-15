import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Button,
  HelperText,
  SegmentedButtons,
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
import { UserRole } from '../../constants/roles';

const loginSchema = z.object({
  emailOrPhone: z.string().min(3, 'Username or Email is required'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.CUSTOMER);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrPhone: 'alex@example.com',
      password: 'password123',
    },
  });

  const loginMutation = useMutation({
    mutationFn: (values: LoginFormValues) =>
      authService.login(values.emailOrPhone, selectedRole),
    onSuccess: async (data) => {
      await storage.setToken(data.token);
      await storage.setUser(data.user);
      dispatch(setCredentials(data));
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text variant="headlineMedium" numberOfLines={1} style={styles.title}>
            Welcome Back
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Hair Salon Appointment & Management App
          </Text>
        </View>

        <View style={styles.roleContainer}>
          <Text variant="labelLarge" style={styles.roleLabel}>
            Choose Demo Role to Log In:
          </Text>
          <SegmentedButtons
            value={selectedRole}
            onValueChange={(val) => setSelectedRole(val as UserRole)}
            buttons={[
              { value: UserRole.CUSTOMER, label: 'Customer' },
              { value: UserRole.RECEPTIONIST, label: 'Receptionist' },
              { value: UserRole.STYLIST, label: 'Stylist' },
            ]}
          />
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="emailOrPhone"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Username / Email"
                mode="outlined"
                left={<TextInput.Icon icon="account" />}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={!!errors.emailOrPhone}
              />
            )}
          />
          {errors.emailOrPhone && (
            <HelperText type="error" visible={true}>
              {errors.emailOrPhone.message}
            </HelperText>
          )}

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Password"
                mode="outlined"
                secureTextEntry={!showPassword}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={!!errors.password}
                style={styles.inputSpacing}
              />
            )}
          />
          {errors.password && (
            <HelperText type="error" visible={true}>
              {errors.password.message}
            </HelperText>
          )}

          <Button
            mode="text"
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotBtn}
          >
            Forgot Password?
          </Button>

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={loginMutation.isPending}
            disabled={loginMutation.isPending}
            style={styles.submitBtn}
            contentStyle={{ paddingVertical: 6 }}
          >
            Sign In
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('Register')}
            style={{ marginTop: 12 }}
          >
            Don't have an account? Sign Up
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 6,
    textAlign: 'center',
  },
  roleContainer: {
    marginBottom: 20,
  },
  roleLabel: {
    marginBottom: 8,
    textAlign: 'center',
    opacity: 0.8,
  },
  form: {
    width: '100%',
  },
  inputSpacing: {
    marginTop: 8,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginVertical: 4,
  },
  submitBtn: {
    marginTop: 16,
    borderRadius: 8,
  },
});
