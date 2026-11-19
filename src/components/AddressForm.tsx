import { ciudadesDe, departamentoNames } from '../data/colombia';
import { SelectField, TextField } from './ui';

export type AddressFormValue = {
  name: string;
  departamento: string;
  ciudad: string;
  direccion: string;
  barrio: string;
  casa: string;
};

export const emptyAddress: AddressFormValue = { name: '', departamento: '', ciudad: '', direccion: '', barrio: '', casa: '' };

export type AddressErrors = Partial<Record<keyof AddressFormValue, string>>;

export function validateAddress(v: AddressFormValue): AddressErrors {
  const e: AddressErrors = {};
  if (!v.departamento) e.departamento = 'Elige el departamento.';
  if (!v.ciudad) e.ciudad = 'Elige la ciudad.';
  if (!v.direccion.trim()) e.direccion = 'Escribe la dirección.';
  if (!v.barrio.trim()) e.barrio = 'Escribe el barrio.';
  return e;
}

const DEPARTAMENTOS = departamentoNames();

export function AddressForm({
  value,
  onChange,
  errors = {},
  showName = true,
}: {
  value: AddressFormValue;
  onChange: (v: AddressFormValue) => void;
  errors?: AddressErrors;
  showName?: boolean;
}) {
  const set = (patch: Partial<AddressFormValue>) => onChange({ ...value, ...patch });
  return (
    <>
      {showName ? (
        <TextField label="Nombre de la dirección" placeholder="Casa, Oficina…" value={value.name} onChangeText={(name) => set({ name })} />
      ) : null}
      <SelectField
        label="Departamento"
        value={value.departamento}
        options={DEPARTAMENTOS}
        onChange={(departamento) => set({ departamento, ciudad: departamento === value.departamento ? value.ciudad : '' })}
        error={errors.departamento}
      />
      <SelectField
        label="Ciudad / municipio"
        value={value.ciudad}
        options={ciudadesDe(value.departamento)}
        onChange={(ciudad) => set({ ciudad })}
        disabled={!value.departamento}
        placeholder={value.departamento ? 'Seleccionar' : 'Primero elige el departamento'}
        error={errors.ciudad}
      />
      <TextField
        label="Dirección"
        placeholder="Calle 10 # 20-30"
        value={value.direccion}
        onChangeText={(direccion) => set({ direccion })}
        error={errors.direccion}
      />
      <TextField label="Barrio" value={value.barrio} onChangeText={(barrio) => set({ barrio })} error={errors.barrio} />
      <TextField
        label="Casa / apto / detalles (opcional)"
        placeholder="Apto 301, torre 2"
        value={value.casa}
        onChangeText={(casa) => set({ casa })}
      />
    </>
  );
}
