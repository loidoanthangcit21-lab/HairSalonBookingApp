import React, { useEffect, useState } from 'react';
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services/userService';
import { useAppDispatch } from '../../store';
import { updateProfile as updateReduxProfile } from '../../store/authSlice';
import { LoadingOverlay } from '../../components/LoadingOverlay';

const updateSchema = z.object({
  fullName: z.string().min(2, 'Full Name is required'),
  phone: z.string().min(9, 'Phone number must be at least 9 digits'),
  address: z.string().optional(),
});

type UpdateFormValues = z.infer<typeof updateSchema>;

export const UpdateProfileScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => userService.getProfile(),
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateFormValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      address: '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        address: profile.address || '',
      });
    }
  }, [profile, reset]);

  const updateMutation = useMutation({
    mutationFn: (values: UpdateFormValues) => userService.updateProfile(values),
    onSuccess: (updatedData) => {
      dispatch(updateReduxProfile(updatedData));
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setSnackbarVisible(true);
      setTimeout(() => {
        navigation.goBack();
      }, 1200);
    },
  });

  const onSubmit = (values: UpdateFormValues) => {
    updateMutation.mutate(values);
  };

  if (isLoading) {
    return <LoadingOverlay message="Loading profile data..." />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Edit Profile" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
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
              style={styles.input}
            />
          )}
        />
        {errors.fullName && <HelperText type="error">{errors.fullName.message}</HelperText>}

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
        {errors.phone && <HelperText type="error">{errors.phone.message}</HelperText>}

        <Controller
          control={control}
          name="address"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Address"
              mode="outlined"
              multiline
              numberOfLines={3}
              left={<TextInput.Icon icon="map-marker" />}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              style={styles.input}
            />
          )}
        />

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={updateMutation.isPending}
          disabled={updateMutation.isPending}
          style={styles.submitBtn}
          contentStyle={{ paddingVertical: 6 }}
        >
          Save Changes
        </Button>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
      >
        Profile updated successfully!
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: -6,
    right: -6,
  },
  input: {
    marginTop: 8,
  },
  submitBtn: {
    marginTop: 24,
    borderRadius: 8,
  },
});
