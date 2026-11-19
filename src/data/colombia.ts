// Departamentos y municipios de Colombia (lista local: ya no se usa la API universal-tutorial con token).
// Fuente: github.com/marcovega/colombia-json + "Bogotá D.C." agregado como departamento.
import data from './colombia.json';

export type Departamento = { departamento: string; ciudades: string[] };

export const DEPARTAMENTOS: Departamento[] = data as Departamento[];

export const departamentoNames = (): string[] => DEPARTAMENTOS.map((d) => d.departamento);

export const ciudadesDe = (departamento: string): string[] =>
  DEPARTAMENTOS.find((d) => d.departamento === departamento)?.ciudades ?? [];
