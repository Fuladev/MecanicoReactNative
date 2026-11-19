import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import type { Service } from '../domain/services';
import { colors, spacing } from '../theme';
import { AppText } from './ui';

type ExtraTile = { label: string; icon: ComponentProps<typeof Ionicons>['name']; onPress: () => void };

export function ServiceGrid({ services, extra }: { services: Service[]; extra?: ExtraTile }) {
  return (
    <View style={styles.grid}>
      {services.map((s) => (
        <Pressable
          key={s.code}
          accessibilityRole="button"
          accessibilityLabel={s.enabled ? s.label : `${s.label}, próximamente`}
          disabled={!s.enabled}
          onPress={() => router.push({ pathname: '/servicio/[code]', params: { code: s.code } })}
          style={({ pressed }) => [styles.item, { opacity: !s.enabled ? 0.45 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] }]}
        >
          <View style={styles.iconWrap}>
            <Image source={s.icon} style={styles.icon} resizeMode="contain" />
          </View>
          <AppText weight="medium" style={styles.label} numberOfLines={2}>
            {s.label}
          </AppText>
          {!s.enabled ? <AppText style={styles.soon}>Próximamente</AppText> : null}
        </Pressable>
      ))}
      {extra ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={extra.label}
          onPress={extra.onPress}
          style={({ pressed }) => [styles.item, { transform: [{ scale: pressed ? 0.96 : 1 }] }]}
        >
          <View style={[styles.iconWrap, { backgroundColor: colors.pink }]}>
            <Ionicons name={extra.icon} size={34} color={colors.primary} />
          </View>
          <AppText weight="medium" style={styles.label} numberOfLines={2}>
            {extra.label}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing(1.5) },
  item: { width: '33.33%', alignItems: 'center', padding: spacing(1.5), marginBottom: spacing(3) },
  iconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  icon: { width: 48, height: 48 },
  label: { marginTop: spacing(2), textAlign: 'center', fontSize: 13, color: colors.dark },
  soon: { fontSize: 11, color: colors.primary },
});
