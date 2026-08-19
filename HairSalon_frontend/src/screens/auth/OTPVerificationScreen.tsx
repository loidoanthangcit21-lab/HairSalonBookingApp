import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput as RNTextInput, View } from 'react-native';
import { Appbar, Button, HelperText, Snackbar, Text, TextInput, useTheme } from 'react-native-paper';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../../services/authService';

export const OTPVerificationScreen = ({ navigation, route }: any) => {
  const theme = useTheme();
  const email = route?.params?.email || 'your email';
  const isRegistration = route?.params?.isRegistration || false;
  const registrationValues = route?.params?.registrationValues;

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const inputRefs = useRef<Array<RNTextInput | null>>([]);

  const bgRegisterMutation = useMutation({
    mutationFn: (values: any) =>
      authService.register({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        password: values.password,
      }),
    onSuccess: () => {
      setSuccessMessage('Account registered! OTP verification code sent to your email.');
    },
    onError: (err: any) => {
      setError(err?.message || 'Registration failed. Please go back and try again.');
    },
  });

  useEffect(() => {
    if (registrationValues) {
      bgRegisterMutation.mutate(registrationValues);
    }
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const otpMutation = useMutation({
    mutationFn: (code: string) => authService.verifyOTP(code, email),
    onSuccess: (_, code) => {
      if (isRegistration) {
        setSuccessMessage('Email verified successfully! Redirecting to Sign In...');
        setTimeout(() => {
          navigation.navigate('Login');
        }, 1500);
      } else {
        navigation.navigate('ResetPassword', { email, otp: code });
      }
    },
    onError: (err: any) => {
      setError(err?.message || 'Invalid OTP code. Please try again.');
    },
  });

  const resendMutation = useMutation({
    mutationFn: () =>
      isRegistration
        ? authService.resendVerificationEmail(email)
        : authService.forgotPassword(email),
    onSuccess: () => {
      setTimer(30);
      setOtp(['', '', '', '', '', '']);
      setError('');
      setSuccessMessage('A new verification OTP code has been sent to your email.');
    },
    onError: (err: any) => {
      setError(err?.message || 'Failed to resend code. Please try again.');
    },
  });

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits of the OTP code.');
      return;
    }
    setError('');

    if (isRegistration) {
      otpMutation.mutate(code);
    } else {
      // For Forgot Password flow, navigate to ResetPassword screen with email & OTP.
      // Backend validates the OTP code when submitting new password via /api/auth/reset-password.
      navigation.navigate('ResetPassword', { email, otp: code });
    }
  };


  const handleResend = () => {
    resendMutation.mutate();
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={isRegistration ? 'Verify Account' : 'Verify OTP'} />
      </Appbar.Header>

      <View style={styles.container}>
        <Text variant="headlineSmall" style={styles.title}>
          {isRegistration ? 'Account Verification' : 'Verify OTP Code'}
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Enter the 6-digit code sent to {email}.
        </Text>

        {bgRegisterMutation.isPending && (
          <HelperText type="info" visible style={{ textAlign: 'center', marginBottom: 12 }}>
            ⚡ Registering account & sending OTP to your email...
          </HelperText>
        )}

        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref: any) => (inputRefs.current[index] = ref)}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              mode="outlined"
              keyboardType="number-pad"
              maxLength={1}
              style={styles.otpBox}
              contentStyle={styles.otpContent}
            />
          ))}
        </View>

        {error ? <HelperText type="error" style={{ textAlign: 'center' }}>{error}</HelperText> : null}

        {bgRegisterMutation.isError && (
          <Button
            mode="outlined"
            icon="arrow-left"
            onPress={() => navigation.goBack()}
            style={{ marginTop: 8, borderRadius: 8 }}
          >
            Back to Edit Registration
          </Button>
        )}

        <Button
          mode="text"
          disabled={timer > 0 || resendMutation.isPending || bgRegisterMutation.isPending}
          loading={resendMutation.isPending}
          onPress={handleResend}
          style={styles.resendBtn}
        >
          {timer > 0 ? `Resend Code (${timer}s)` : 'Resend OTP Code'}
        </Button>

        <Button
          mode="contained"
          onPress={handleVerify}
          loading={otpMutation.isPending}
          disabled={otpMutation.isPending || bgRegisterMutation.isPending}
          style={styles.submitBtn}
          contentStyle={{ paddingVertical: 6 }}
        >
          {isRegistration ? 'Verify & Activate Account' : 'Verify Code'}
        </Button>
      </View>

      <Snackbar
        visible={!!successMessage}
        onDismiss={() => setSuccessMessage('')}
        duration={3000}
      >
        {successMessage}
      </Snackbar>
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginTop: 16,
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
    opacity: 0.7,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 320,
    marginBottom: 16,
  },
  otpBox: {
    width: 45,
    height: 55,
  },
  otpContent: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  resendBtn: {
    marginVertical: 12,
  },
  submitBtn: {
    marginTop: 16,
    width: '100%',
    borderRadius: 8,
  },
});
