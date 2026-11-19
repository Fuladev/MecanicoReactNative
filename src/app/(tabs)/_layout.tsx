import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/js-tabs';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';
import { colors, fonts } from '../../theme';

type IconName = ComponentProps<typeof Ionicons>['name'];
const icon = (focusedName: IconName, name: IconName) =>
  function TabIcon({ focused, color, size }: { focused: boolean; color: ColorValue; size: number }) {
    return <Ionicons name={focused ? focusedName : name} color={color as string} size={size} />;
  };

/** Misma barra inferior que la app iOS: Hogar, Motor y Pedidos. El perfil se abre desde la cabecera. */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11 },
        headerTitleStyle: { fontFamily: fonts.bold },
        headerTintColor: colors.dark,
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Hogar', tabBarIcon: icon('home', 'home-outline') }} />
      <Tabs.Screen name="motores" options={{ title: 'Motor', tabBarIcon: icon('car-sport', 'car-sport-outline') }} />
      <Tabs.Screen name="pedidos" options={{ title: 'Pedidos', tabBarIcon: icon('time', 'time-outline') }} />
    </Tabs>
  );
}
