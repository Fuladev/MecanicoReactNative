import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_700Bold,
  useFonts,
} from '@expo-google-fonts/montserrat';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Loading } from '../components/ui';
import { AuthProvider, useAuth } from '../context/AuthProvider';
import { colors, fonts } from '../theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function RootNavigator() {
  const { user, profile, initializing, profileComplete } = useAuth();
  const loadingProfile = !!user && profile === undefined;

  useEffect(() => {
    if (!initializing && !loadingProfile) SplashScreen.hideAsync().catch(() => undefined);
  }, [initializing, loadingProfile]);

  if (initializing || loadingProfile) return <Loading />;

  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.dark,
        headerTitleStyle: { fontFamily: fonts.bold },
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Protected guard={!user}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!!user && !profileComplete}>
        <Stack.Screen name="completar-perfil" options={{ title: 'Completa tus datos' }} />
      </Stack.Protected>
      <Stack.Protected guard={!!user && profileComplete}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="servicio/[code]" options={{ title: 'Solicitar servicio' }} />
        <Stack.Screen name="otros" options={{ title: 'Otros servicios' }} />
        <Stack.Screen name="direcciones/nueva" options={{ title: 'Nueva dirección', presentation: 'modal' }} />
        <Stack.Screen name="perfil/editar" options={{ title: 'Editar perfil' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold });
  if (!fontsLoaded && !fontError) return null;
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
