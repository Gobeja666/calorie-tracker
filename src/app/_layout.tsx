import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../AuthContext';
import { FoodProvider } from '../FoodContext';
import { ProfileProvider } from '../ProfileContext';
import { WeightProvider } from '../WeightContext';
import { NotificationsProvider, NotificationManager } from '../NotificationsContext';
import NavBar from '../NavBar';
import { t } from '../strings';
import { WorkoutProvider } from '../WorkoutContext';

// Sends logged-out users to Login, and logged-in users away from Login/Register
function AuthGate() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const onAuthPage = segments[0] === 'login' || segments[0] === 'register';
    if (!session && !onAuthPage) router.replace('/login');
    else if (session && onAuthPage) router.replace('/');
  }, [session, loading, segments]);

  return null;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <ProfileProvider>
          <FoodProvider>
            <WorkoutProvider>
              <WeightProvider>
              <AuthGate />
              <NotificationManager />
              <View style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                  <Stack
                    screenOptions={{
                      headerBackVisible: false,
                      headerTitle: t.appName,
                      headerTitleAlign: 'center',
                    }}
                  />
                </View>
                <NavBar />
              </View>
            </WeightProvider>
          </WorkoutProvider>
          </FoodProvider>
        </ProfileProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}