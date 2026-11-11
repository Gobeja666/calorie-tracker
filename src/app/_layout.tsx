import { View } from 'react-native';
import { Stack } from 'expo-router';
import { FoodProvider } from '../FoodContext';
import { ProfileProvider } from '../ProfileContext';
import { WeightProvider } from '../WeightContext';
import NavBar from '../NavBar';
import { t } from '../strings';

export default function RootLayout() {
  return (
    <ProfileProvider>
      <FoodProvider>
        <WeightProvider>
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
      </FoodProvider>
    </ProfileProvider>
  );
}