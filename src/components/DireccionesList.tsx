import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import type { ReactElement } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useAuth } from '../context/AuthProvider';
import { confirmAction, notify } from '../dialogs';
import { useAddresses } from '../hooks';
import { deleteAddress } from '../services/users';
import { colors, spacing } from '../theme';
import { AppText, Button, Card, EmptyState, ErrorText, Loading } from './ui';

/** "Mis direcciones" de la app iOS: cada tarjeta con Editar y Eliminar. */
export function DireccionesList({ header }: { header?: ReactElement }) {
  const { user } = useAuth();
  const { data, loading, error } = useAddresses();

  const confirmDelete = (id: string, name: string) => {
    if (data.length <= 1) return notify('No se puede eliminar', 'Necesitas al menos una dirección para pedir servicios.');
    confirmAction({
      title: 'Eliminar dirección',
      message: `¿Eliminar "${name}"?`,
      confirmText: 'Eliminar',
      destructive: true,
      onConfirm: () => user && deleteAddress(user.uid, id).catch(() => notify('Error', 'No se pudo eliminar.')),
    });
  };

  return (
    <FlatList
      data={loading ? [] : data}
      keyExtractor={(a) => a.id}
      contentContainerStyle={{ padding: spacing(5), flexGrow: 1 }}
      ListHeaderComponent={
        <>
          {header}
          <ErrorText>{error}</ErrorText>
        </>
      }
      renderItem={({ item }) => (
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(3) }}>
          <View style={styles.pin}>
            <Ionicons name="location" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText weight="bold" style={{ color: colors.dark }}>
              {item.name}
            </AppText>
            <AppText style={{ fontSize: 14 }}>{item.dirComplete}</AppText>
            <AppText style={{ fontSize: 12, color: colors.muted }}>{item.departamento}</AppText>
          </View>
          <View style={{ gap: spacing(3) }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Editar ${item.name}`}
              hitSlop={8}
              onPress={() => router.push({ pathname: '/direcciones/[id]', params: { id: item.id } })}
            >
              <Ionicons name="create-outline" size={22} color={colors.dark} />
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={`Eliminar ${item.name}`} hitSlop={8} onPress={() => confirmDelete(item.id, item.name)}>
              <Ionicons name="trash-outline" size={22} color={colors.primary} />
            </Pressable>
          </View>
        </Card>
      )}
      ListEmptyComponent={loading ? <Loading /> : <EmptyState title="No tienes direcciones" message="Agrega una para poder pedir servicios." />}
      ListFooterComponent={
        <Button
          title="Agregar dirección"
          icon={<Ionicons name="add-circle-outline" size={20} color={colors.white} />}
          onPress={() => router.push('/direcciones/nueva')}
          style={{ marginTop: spacing(3) }}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  pin: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.pink, alignItems: 'center', justifyContent: 'center' },
});
