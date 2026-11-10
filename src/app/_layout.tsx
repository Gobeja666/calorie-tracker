import { Stack } from 'expo-router';
import { FoodProvider } from '../FoodContext';
import { ProfileProvider } from '../ProfileContext';
import { WeightProvider } from '../WeightContext';
import { t } from '../strings';

export default function RootLayout() {
  return (
    <ProfileProvider>
      <FoodProvider>
        <WeightProvider>
          <Stack>
            <Stack.Screen name="index" options={{ title: t.screenTitles.today }} />
            <Stack.Screen name="meals" options={{ title: t.screenTitles.meals }} />
            <Stack.Screen name="profile" options={{ title: t.screenTitles.profile }} />
          </Stack>
        </WeightProvider>
      </FoodProvider>
    </ProfileProvider>
  );
}