import { buildAddress, buildDirComplete, normalizeStoredAddress } from '../address';

describe('direcciones', () => {
  it('arma dirComplete con los valores del formulario', () => {
    expect(buildDirComplete({ direccion: ' Calle 1 # 2-3 ', casa: 'Apto 301', barrio: 'Centro', ciudad: 'Cali' })).toBe(
      'Calle 1 # 2-3, Apto 301, Centro, Cali',
    );
  });

  it('siempre guarda name y país', () => {
    const a = buildAddress({ name: '', departamento: 'Valle del Cauca', ciudad: 'Cali', direccion: 'Calle 1', barrio: 'Centro', casa: '' });
    expect(a.name).toBe('Principal');
    expect(a.pais).toBe('Colombia');
    expect(a).not.toHaveProperty('casa');
  });

  it('lee direcciones antiguas sin name ni dirComplete válido', () => {
    const a = normalizeStoredAddress(
      {
        ciudad: 'Bogotá',
        barrio: 'Chapinero',
        direccion: 'Cra 7 # 45-10',
        dirComplete: 'androidx.appcompat.widget.AppCompatEditText{3b2c1a9 VFED..CL. ........ 0,0-0,0 #7f0a00d1 app:id/et_dir} Chapinero',
      },
      1,
    );
    expect(a.name).toBe('Dirección 2');
    expect(a.dirComplete).toBe('Cra 7 # 45-10, Chapinero, Bogotá');
  });

  it('no falla con datos vacíos', () => {
    expect(normalizeStoredAddress(null).name).toBe('Principal');
  });
});
