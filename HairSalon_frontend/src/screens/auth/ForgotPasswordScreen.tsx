import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Appbar,
  Avatar,
  Button,
  Dialog,
  HelperText,
  Portal,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../../services/authService';

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);

  const forgotMutation = useMutation({
    mutationFn: (targetEmail: string) => authService.forgotPassword(targetEmail),
    onSuccess: () => {
      setDialogVisible(true);
    },
  });

  const handleSubmit = () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    forgotMutation.mutate(email);
  };

  const handleDialogDismiss = () => {
    setDialogVisible(false);
    navigation.navigate('OTPVerification', { email });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Forgot Password" />
      </Appbar.Header>

      <View style={styles.container}>
        <View style={styles.hero}>
          <Avatar.Icon
            icon="lock-reset"
            size={64}
            style={{ backgroundColor: theme.colors.primaryContainer }}
          />
          <Text variant="headlineSmall" style={styles.title}>
            Reset Password
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Enter your registered email address below. We will send a 6-digit OTP verification code to reset your password.
          </Text>
        </View>

        <TextInput
          label="Email Address"
          mode="outlined"
          keyboardType="email-address"
          left={<TextInput.Icon icon="email" />}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (error) setError('');
          }}
          error={!!error}
        />
        {error ? <HelperText type="error">{error}</HelperText> : null}

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={forgotMutation.isPending}
          disabled={forgotMutation.isPending}
          style={styles.submitBtn}
          contentStyle={{ paddingVertical: 6 }}
        >
          Send Verification Code
        </Button>
      </View>

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={handleDialogDismiss}>
          <Dialog.Title>OTP Code Dispatched</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              A 6-digit verification code has been sent to {email}. Please enter it on the next screen.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleDialogDismiss}>Enter Code</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  title: {
    fontWeight: 'bold',
    marginTop: 12,
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
  submitBtn: {
    marginTop: 24,
    borderRadius: 8,
  },
});
