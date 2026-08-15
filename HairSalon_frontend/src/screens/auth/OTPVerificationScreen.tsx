import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput as RNTextInput, View } from 'react-native';
import { Appbar, Button, HelperText, Text, TextInput, useTheme } from 'react-native-paper';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../../services/authService';

export const OTPVerificationScreen = ({ navigation, route }: any) => {
  const theme = useTheme();
  const email = route?.params?.email || 'your email';

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState('');

  const inputRefs = useRef<Array<RNTextInput | null>>([]);

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
    mutationFn: (code: string) => authService.verifyOTP(code),
    onSuccess: () => {
      navigation.navigate('ResetPassword');
    },
    onError: () => {
      setError('Invalid OTP code. Please try again.');
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
    otpMutation.mutate(code);
  };

  const handleResend = () => {
    setTimer(30);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Verify OTP" />
      </Appbar.Header>

      <View style={styles.container}>
        <Text variant="headlineSmall" style={styles.title}>
          Verify OTP Code
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Enter the 6-digit code sent to {email}.
        </Text>

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

        <Button
          mode="text"
          disabled={timer > 0}
          onPress={handleResend}
          style={styles.resendBtn}
        >
          {timer > 0 ? `Resend Code (${timer}s)` : 'Resend OTP Code'}
        </Button>

        <Button
          mode="contained"
          onPress={handleVerify}
          loading={otpMutation.isPending}
          disabled={otpMutation.isPending}
          style={styles.submitBtn}
          contentStyle={{ paddingVertical: 6 }}
        >
          Verify Code
        </Button>
      </View>
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
