import { router } from 'expo-router';
import { Alert, FlatList, Pressable, View } from 'react-native';
import { AppText, Button, Card, EmptyState, ErrorText, Loading } from '../../components/ui';
import { useAuth } from '../../context/AuthProvider';
import { useAddresses } from '../../hooks';
import { deleteAddress } from '../../services/users';
import { colors, spacing } from '../../theme';

export default function Direcciones() {
  const { user } = useAuth();
  const { data, loading, error } = useAddresses();
  if (loading) return <Loading />;

  const confirmDelete = (id: string, name: string) => {
    if (data.length <= 1) return Alert.alert('No se puede eliminar', 'Necesitas al menos una dirección.');
    Alert.alert('Eliminar dirección', `¿Eliminar "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => user && deleteAddress(user.uid, id).catch(() => Alert.alert('Error', 'No se pudo eliminar.')) },
    ]);
  };

  return (
    <FlatList
      data={data}
      keyExtractor={(a) => a.id}
      contentContainerStyle={{ padding: spacing(5), flexGrow: 1 }}
      ListHeaderComponent={<ErrorText>{error}</ErrorText>}
      renderItem={({ item }) => (
        <Card style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <AppText weight="bold" style={{ color: colors.dark }}>
              {item.name}
            </AppText>
            <AppText>{item.dirComplete}</AppText>
            <AppText style={{ fontSize: 12, color: colors.muted }}>{item.departamento}</AppText>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={`Eliminar ${item.name}`} hitSlop={10} onPress={() => confirmDelete(item.id, item.name)}>
            <AppText style={{ color: colors.primary }}>Eliminar</AppText>
          </Pressable>
        </Card>
      )}
      ListEmptyComponent={<EmptyState title="No tienes direcciones" message="Agrega una para poder pedir servicios." />}
      ListFooterComponent={<Button title="Agregar dirección" onPress={() => router.push('/direcciones/nueva')} style={{ marginTop: spacing(3) }} />}
    />
  );
}
