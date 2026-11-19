import { buildPedido, formatLegacyDate, parseLegacyDate, pedidoUpdates, sortPedidos, stateLabel } from '../pedido';
import { getService, getServiceByTipo, SERVICES } from '../services';

const profile = { name: ' Ana ', apel: 'Pérez', mail: 'ana@example.com', phone: '3001234567' };
const address = {
  id: 'dir1',
  name: 'Casa',
  pais: 'Colombia',
  departamento: 'Antioquia',
  ciudad: 'Medellín',
  direccion: 'Calle 10 # 20-30',
  barrio: 'Laureles',
  dirComplete: 'Calle 10 # 20-30, Laureles, Medellín',
};

describe('buildPedido', () => {
  const now = new Date(2026, 10, 18, 9, 5, 7);
  const pedido = buildPedido({
    uid: 'u1',
    pedidoId: 'p1',
    profile,
    address,
    service: getService('belleza')!,
    marca: 'Manicure',
    des: 'Uñas',
    now,
    createdAt: 123,
  });

  it('escribe todos los campos legacy que espera la app de proveedores', () => {
    expect(pedido).toMatchObject({
      name: 'Ana',
      apel: 'Pérez',
      mail: 'ana@example.com',
      cel: '3001234567',
      dir: address.dirComplete,
      ciu: 'Medellín',
      barr: 'Laureles',
      des: 'Uñas',
      marca: 'Manicure',
      date: '18/11/26 / 09:05:07',
      id: 'u1',
      mecanico: 'No se ha asignado un mecanico',
      state: 'Processing',
    });
  });

  it('usa el Tipo correcto (Belleza ya no se guarda como "Lav.")', () => {
    expect(pedido.Tipo).toBe('Belleza');
  });

  it('agrega los campos nuevos sin quitar los viejos', () => {
    expect(pedido).toMatchObject({ pedidoId: 'p1', servicio: 'belleza', createdAt: 123, estado: 'pendiente', direccionId: 'dir1' });
    expect(pedido).not.toHaveProperty('pass');
  });

  it('escribe el mismo ID en la cola global y en el historial', () => {
    const updates = pedidoUpdates('u1', { ...pedido, pedidoId: 'p1' });
    expect(Object.keys(updates).sort()).toEqual(['Pedido/u1/p1', 'Pedidos/p1']);
    expect(updates['Pedidos/p1']).toBe(updates['Pedido/u1/p1']);
  });
});

describe('catálogo de servicios', () => {
  it('corrige los Tipo que estaban mal en la app Java', () => {
    expect(getService('maquinas_coser')!.tipo).toBe('MCoser');
    expect(getService('maquinaria_pesada')!.tipo).toBe('MAmarilla');
    expect(getService('computadores')!.tipo).toBe('Equipos');
  });

  it('mantiene los Tipo existentes', () => {
    const tipos = Object.fromEntries(SERVICES.map((s) => [s.code, s.tipo]));
    expect(tipos).toMatchObject({
      lavadoras: 'Lav.',
      neveras: 'Nev.',
      aires: 'Air.',
      cerrajeria: 'Cer.',
      muebles: 'Mueb.',
      reformas: 'Reformas',
      servicio_medico: 'ServMedico',
      autos: 'Auto',
      motos: 'Moto',
      bicicletas: 'Bici',
      transporte: 'Transporte',
    });
  });

  it('los códigos y los Tipo son únicos', () => {
    expect(new Set(SERVICES.map((s) => s.code)).size).toBe(SERVICES.length);
    expect(new Set(SERVICES.map((s) => s.tipo)).size).toBe(SERVICES.length);
  });

  it('reconoce el valor antiguo "Comp." en el historial', () => {
    expect(getServiceByTipo('Comp.')?.code).toBe('computadores');
  });
});

describe('fechas', () => {
  it('formatea y lee el formato legacy', () => {
    const d = new Date(2024, 0, 2, 3, 4, 5);
    expect(formatLegacyDate(d)).toBe('02/01/24 / 03:04:05');
    expect(parseLegacyDate('02/01/24 / 03:04:05')).toBe(d.getTime());
    expect(parseLegacyDate('basura')).toBe(0);
  });

  it('ordena cronológicamente (antes ordenaba por texto, es decir por día)', () => {
    const list = [
      { date: '31/01/24 / 10:00:00' },
      { date: '01/02/24 / 10:00:00' },
      { date: '15/12/23 / 10:00:00' },
      { createdAt: new Date(2024, 1, 5).getTime(), date: '05/02/24 / 00:00:00' },
    ];
    expect(sortPedidos(list).map((p) => p.date)).toEqual([
      '05/02/24 / 00:00:00',
      '01/02/24 / 10:00:00',
      '31/01/24 / 10:00:00',
      '15/12/23 / 10:00:00',
    ]);
  });
});

describe('stateLabel', () => {
  it('traduce el estado legacy', () => {
    expect(stateLabel({ state: 'Processing' })).toBe('En proceso');
    expect(stateLabel({ state: 'Asignado a Juan' })).toBe('Asignado a Juan');
  });
});
