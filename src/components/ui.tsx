import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type TextProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, spacing } from '../theme';

export function AppText({ style, weight = 'regular', ...rest }: TextProps & { weight?: keyof typeof fonts }) {
  return <Text {...rest} style={[{ fontFamily: fonts[weight], color: colors.text, fontSize: 15 }, style]} />;
}

export function Title({ children, style }: { children: ReactNode; style?: TextProps['style'] }) {
  return (
    <AppText weight="bold" style={[{ fontSize: 22, color: colors.dark, marginBottom: spacing(3) }, style]}>
      {children}
    </AppText>
  );
}

export function Screen({
  children,
  scroll = true,
  padded = true,
  edges = ['bottom'],
}: {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}) {
  const content = padded ? { padding: spacing(5) } : undefined;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={edges}>
      {scroll ? (
        <ScrollView contentContainerStyle={[content, { flexGrow: 1 }]} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, content]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: ReactNode;
};

export function Button({ title, onPress, variant = 'primary', loading, disabled, style, icon }: ButtonProps) {
  const palette = {
    primary: { bg: colors.primary, fg: colors.white, border: colors.primary },
    secondary: { bg: colors.white, fg: colors.dark, border: colors.border },
    ghost: { bg: 'transparent', fg: colors.primary, border: 'transparent' },
    danger: { bg: colors.white, fg: colors.primary, border: colors.primary },
  }[variant];
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: palette.bg, borderColor: palette.border, opacity: isDisabled ? 0.6 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(2) }}>
          {icon}
          <AppText weight="bold" style={{ color: palette.fg }}>
            {title}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

export function Field({ label, error, children }: { label: string; error?: string | null; children: ReactNode }) {
  return (
    <View style={{ marginBottom: spacing(4) }}>
      <AppText weight="medium" style={styles.label}>
        {label}
      </AppText>
      {children}
      {error ? <AppText style={styles.error}>{error}</AppText> : null}
    </View>
  );
}

export function TextField({ label, error, style, ...rest }: TextInputProps & { label: string; error?: string | null }) {
  return (
    <Field label={label} error={error}>
      <TextInput
        placeholderTextColor={colors.muted}
        {...rest}
        accessibilityLabel={label}
        style={[styles.input, error ? { borderColor: colors.primary } : null, style]}
      />
    </Field>
  );
}

/** Selector con búsqueda (sirve para listas largas como los municipios). */
export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = 'Seleccionar',
  error,
  disabled,
  renderOption,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string | null;
  disabled?: boolean;
  renderOption?: (v: string) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const filtered = query ? options.filter((o) => norm(o).includes(norm(query))) : options;
  return (
    <Field label={label} error={error}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value || placeholder}`}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[styles.input, styles.select, disabled && { opacity: 0.5 }, error ? { borderColor: colors.primary } : null]}
      >
        <AppText style={{ color: value ? colors.dark : colors.muted, flex: 1 }} numberOfLines={1}>
          {value || placeholder}
        </AppText>
        <AppText style={{ color: colors.muted }}>▾</AppText>
      </Pressable>
      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
          <View style={styles.modalHeader}>
            <AppText weight="bold" style={{ fontSize: 18, color: colors.dark, flex: 1 }}>
              {label}
            </AppText>
            <Pressable accessibilityRole="button" onPress={() => setOpen(false)} hitSlop={12}>
              <AppText weight="bold" style={{ color: colors.primary }}>
                Cerrar
              </AppText>
            </Pressable>
          </View>
          {options.length > 12 ? (
            <TextInput
              placeholder="Buscar…"
              placeholderTextColor={colors.muted}
              value={query}
              onChangeText={setQuery}
              style={[styles.input, { marginHorizontal: spacing(5), marginBottom: spacing(2) }]}
              autoCorrect={false}
            />
          ) : null}
          <FlatList
            data={filtered}
            keyExtractor={(i) => i}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  onChange(item);
                  setQuery('');
                  setOpen(false);
                }}
                style={({ pressed }) => [styles.option, (pressed || item === value) && { backgroundColor: colors.pink }]}
              >
                {renderOption ? renderOption(item) : <AppText style={{ color: colors.dark }}>{item}</AppText>}
              </Pressable>
            )}
          />
        </SafeAreaView>
      </Modal>
    </Field>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Loading() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing(8) }}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}

export function EmptyState({ title, message, action }: { title: string; message?: string; action?: ReactNode }) {
  return (
    <View style={{ alignItems: 'center', padding: spacing(8), gap: spacing(3) }}>
      <AppText weight="bold" style={{ fontSize: 17, color: colors.dark, textAlign: 'center' }}>
        {title}
      </AppText>
      {message ? <AppText style={{ textAlign: 'center' }}>{message}</AppText> : null}
      {action}
    </View>
  );
}

export function ErrorText({ children }: { children?: string | null }) {
  if (!children) return null;
  return <AppText style={[styles.error, { marginBottom: spacing(3) }]}>{children}</AppText>;
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing(5),
    marginBottom: spacing(3),
  },
  label: { fontSize: 13, color: colors.dark, marginBottom: spacing(1.5) },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.white,
    paddingHorizontal: spacing(4),
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.dark,
  },
  select: { flexDirection: 'row', alignItems: 'center' },
  error: { color: colors.primary, fontSize: 13, marginTop: spacing(1) },
  modalHeader: { flexDirection: 'row', alignItems: 'center', padding: spacing(5) },
  option: { paddingHorizontal: spacing(5), paddingVertical: spacing(3.5), borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing(4),
    marginBottom: spacing(3),
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});
