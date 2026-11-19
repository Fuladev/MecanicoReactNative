import type { ImageSourcePropType } from 'react-native';

/**
 * Catálogo único de servicios. Reemplaza las 15 pantallas casi idénticas de la app Java.
 *
 * `tipo` es el valor que se escribe en el campo legacy `Tipo` de los pedidos. Debe coincidir con lo que
 * esperan la lista "Mis pedidos" de la app anterior y la app de proveedores. Corrección respecto a la app
 * Java: Belleza, Máquina de coser y Maquinaria pesada escribían "Lav." y Computadores escribía "Comp.";
 * ahora usan los valores que la lista sí reconoce ("Belleza", "MCoser", "MAmarilla", "Equipos").
 *
 * `code` es el código normalizado nuevo (campo `servicio`), que se escribe además del legacy.
 */
export type ServiceCategory = 'hogar' | 'motores' | 'otros';

export type ServiceCode =
  | 'lavadoras'
  | 'neveras'
  | 'aires'
  | 'cerrajeria'
  | 'muebles'
  | 'maquinas_coser'
  | 'belleza'
  | 'reformas'
  | 'computadores'
  | 'servicio_medico'
  | 'autos'
  | 'motos'
  | 'bicicletas'
  | 'maquinaria_pesada'
  | 'transporte'
  | 'desvare'
  | 'lavado_autos';

export type Brand = { name: string; logo?: ImageSourcePropType };

export type Service = {
  code: ServiceCode;
  tipo: string;
  label: string;
  /** Texto que se muestra en el historial, delante de la marca/detalle. */
  historyLabel: string;
  category: ServiceCategory;
  icon: ImageSourcePropType;
  cover?: ImageSourcePropType;
  /** Si tiene marcas, se elige de la lista; si no, `detailLabel` pide un texto libre que va en `marca`. */
  brands?: Brand[];
  detailLabel: string;
  enabled: boolean;
};

const electroBrands: Brand[] = [
  { name: 'LG', logo: require('../../assets/images/brands/lg.png') },
  { name: 'Samsung', logo: require('../../assets/images/brands/samsung.png') },
  { name: 'Whirlpool', logo: require('../../assets/images/brands/whirlpool.png') },
  { name: 'Centrales', logo: require('../../assets/images/brands/centrales.png') },
  { name: 'Mabe', logo: require('../../assets/images/brands/mabe.png') },
  { name: 'Haceb', logo: require('../../assets/images/brands/haceb.png') },
  { name: 'Electrolux', logo: require('../../assets/images/brands/electrolux.png') },
  { name: 'Abba', logo: require('../../assets/images/brands/abba.png') },
  { name: 'Icasa', logo: require('../../assets/images/brands/icasa.png') },
  { name: 'Indurama', logo: require('../../assets/images/brands/indurama.png') },
  { name: 'Otra' },
];

const svc = (s: Omit<Service, 'enabled' | 'historyLabel'> & { enabled?: boolean; historyLabel?: string }): Service => ({
  enabled: true,
  historyLabel: s.label,
  ...s,
});

export const SERVICES: Service[] = [
  // Hogar
  svc({ code: 'lavadoras', tipo: 'Lav.', label: 'Lavadoras', historyLabel: 'Lavadora', category: 'hogar', icon: require('../../assets/images/services/lav.png'), cover: require('../../assets/images/portadas/lav.png'), brands: electroBrands, detailLabel: 'Marca' }),
  svc({ code: 'neveras', tipo: 'Nev.', label: 'Neveras', historyLabel: 'Nevera', category: 'hogar', icon: require('../../assets/images/services/nev.png'), cover: require('../../assets/images/portadas/nev.png'), brands: electroBrands, detailLabel: 'Marca' }),
  svc({ code: 'aires', tipo: 'Air.', label: 'Aires acondicionados', historyLabel: 'Aire', category: 'hogar', icon: require('../../assets/images/services/aire.png'), cover: require('../../assets/images/portadas/aire.png'), brands: electroBrands, detailLabel: 'Marca' }),
  svc({ code: 'cerrajeria', tipo: 'Cer.', label: 'Cerrajería', category: 'hogar', icon: require('../../assets/images/services/cerr.png'), cover: require('../../assets/images/portadas/cerr.png'), detailLabel: 'Tipo de cerradura o puerta' }),
  svc({ code: 'muebles', tipo: 'Mueb.', label: 'Limpieza de muebles', category: 'hogar', icon: require('../../assets/images/services/mueb.png'), cover: require('../../assets/images/portadas/mueb.png'), detailLabel: 'Tipo de mueble' }),
  // Otros
  svc({ code: 'maquinas_coser', tipo: 'MCoser', label: 'Máquinas de coser', category: 'otros', icon: require('../../assets/images/services/coser.png'), cover: require('../../assets/images/portadas/coser.png'), detailLabel: 'Marca de la máquina' }),
  svc({ code: 'belleza', tipo: 'Belleza', label: 'Belleza', category: 'otros', icon: require('../../assets/images/services/belleza.png'), cover: require('../../assets/images/portadas/belleza.png'), detailLabel: 'Servicio que necesitas' }),
  svc({ code: 'reformas', tipo: 'Reformas', label: 'Obras y reformas', category: 'otros', icon: require('../../assets/images/services/obras.png'), cover: require('../../assets/images/portadas/reformas.png'), detailLabel: 'Tipo de obra' }),
  svc({ code: 'computadores', tipo: 'Equipos', label: 'Computadores', category: 'otros', icon: require('../../assets/images/services/pc.png'), cover: require('../../assets/images/portadas/pc.png'), detailLabel: 'Marca del equipo' }),
  svc({ code: 'servicio_medico', tipo: 'ServMedico', label: 'Servicio médico', category: 'otros', icon: require('../../assets/images/services/doctor.png'), cover: require('../../assets/images/portadas/medico.png'), detailLabel: 'Especialidad' }),
  // Motores
  svc({ code: 'autos', tipo: 'Auto', label: 'Autos', category: 'motores', icon: require('../../assets/images/services/car.png'), cover: require('../../assets/images/portadas/auto.png'), detailLabel: 'Marca y modelo' }),
  svc({ code: 'motos', tipo: 'Moto', label: 'Motocicletas', category: 'motores', icon: require('../../assets/images/services/moto.png'), cover: require('../../assets/images/portadas/moto.png'), detailLabel: 'Marca y modelo' }),
  svc({ code: 'bicicletas', tipo: 'Bici', label: 'Bicicletas', category: 'motores', icon: require('../../assets/images/services/bike.png'), cover: require('../../assets/images/portadas/bici.png'), detailLabel: 'Marca' }),
  svc({ code: 'maquinaria_pesada', tipo: 'MAmarilla', label: 'Maquinaria pesada', category: 'motores', icon: require('../../assets/images/services/maquinaria.png'), cover: require('../../assets/images/portadas/maquinaria.png'), detailLabel: 'Tipo de máquina' }),
  svc({ code: 'transporte', tipo: 'Transporte', label: 'Transporte de carga', category: 'motores', icon: require('../../assets/images/services/transporte.png'), cover: require('../../assets/images/portadas/transporte.png'), detailLabel: 'Qué necesitas transportar' }),
  // Sin terminar en la app Java: se muestran como "Próximamente" hasta definir su `Tipo` con la app de proveedores.
  svc({ code: 'desvare', tipo: 'Desvare', label: 'Desvare', category: 'motores', icon: require('../../assets/images/services/car.png'), detailLabel: 'Marca y modelo', enabled: false }),
  svc({ code: 'lavado_autos', tipo: 'LavAutos', label: 'Lavado de autos', category: 'motores', icon: require('../../assets/images/services/car.png'), detailLabel: 'Marca y modelo', enabled: false }),
];

export const getService = (code: string): Service | undefined => SERVICES.find((s) => s.code === code);

/** Busca un servicio por el valor legacy `Tipo`. Acepta los valores erróneos antiguos ("Comp."). */
export const getServiceByTipo = (tipo?: string | null): Service | undefined => {
  if (!tipo) return undefined;
  const normalized = tipo === 'Comp.' ? 'Equipos' : tipo;
  return SERVICES.find((s) => s.tipo === normalized);
};

export const servicesByCategory = (category: ServiceCategory) => SERVICES.filter((s) => s.category === category);
