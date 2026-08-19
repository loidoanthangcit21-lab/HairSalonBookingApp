import React, { useEffect, useState } from 'react';
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
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { authService } from '../../services/authService';
import { storage } from '../../utils/storage';
import { useAppDispatch } from '../../store';
import { setCredentials } from '../../store/authSlice';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    try {
      if (GoogleSignin && typeof GoogleSignin.configure === 'function') {
        GoogleSignin.configure({
          webClientId: '870197791443-vjdrda8ao3pkoldu1imps251v5adu311.apps.googleusercontent.com',
          offlineAccess: true,
        });
      }
    } catch (err) {
      console.log('GoogleSignin configure error:', err);
    }
  }, []);



  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: (values: LoginFormValues) =>
      authService.login(values.email, values.password),
    onSuccess: async (data) => {
      await storage.setToken(data.token);
      await storage.setUser(data.user);
      dispatch(setCredentials(data));
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  const googleMutation = useMutation({
    mutationFn: (idToken: string) => authService.googleLogin(idToken),
    onSuccess: async (data) => {
      await storage.setToken(data.token);
      await storage.setUser(data.user);
      dispatch(setCredentials(data));
    },
  });

  const [googleError, setGoogleError] = useState('');

  const handleGoogleSignIn = async () => {
    setGoogleError('');
    try {
      if (GoogleSignin && typeof GoogleSignin.hasPlayServices === 'function') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const response = await GoogleSignin.signIn();
        const idToken = response.data?.idToken || (response as any).idToken;
        if (idToken) {
          googleMutation.mutate(idToken);
          return;
        }
      }
      setGoogleError('Unable to obtain Google ID Token from Google Sign-In SDK.');
    } catch (err: any) {
      console.log('Google Sign-In Error:', err);
      if (err?.code === '12501' || err?.code === 'SIGN_IN_CANCELLED') {
        // User cancelled Google sign in dialog
        return;
      }
      if (err?.code === '10' || err?.toString().includes('DEVELOPER_ERROR')) {
        setGoogleError(
          'Google DEVELOPER_ERROR: Please ensure you use a "Web application" Client ID for webClientId, and your Android Client ID with SHA-1 (5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25) is created in the same Google Cloud Console project.'
        );
      } else {
        setGoogleError(err?.message || 'Google Sign-In failed. Please check Google Play Services.');
      }
    }
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

        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Username / Email"
                mode="outlined"
                left={<TextInput.Icon icon="account" />}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={!!errors.email}
              />
            )}
          />
          {errors.email && (
            <HelperText type="error" visible={true}>
              {errors.email.message}
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

          {(loginMutation.isError || googleMutation.isError || !!googleError) && (
            <HelperText type="error" visible={true} style={{ textAlign: 'center', marginTop: 8 }}>
              {googleError || loginMutation.error?.message || googleMutation.error?.message}
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
            disabled={loginMutation.isPending || googleMutation.isPending}
            style={styles.submitBtn}
            contentStyle={{ paddingVertical: 6 }}
          >
            Sign In
          </Button>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text variant="labelMedium" style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            mode="outlined"
            icon="google"
            onPress={handleGoogleSignIn}
            loading={googleMutation.isPending}
            disabled={googleMutation.isPending || loginMutation.isPending}
            style={styles.googleBtn}
            contentStyle={{ paddingVertical: 6 }}
          >
            Sign In with Google
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 12,
    opacity: 0.6,
  },
  googleBtn: {
    borderRadius: 8,
    borderColor: '#CCC',
  },
});

