import { isValidEmail, isValidPhone, normalizePhone, passwordError } from '../validation';
import { ciudadesDe, departamentoNames } from '../../data/colombia';

describe('validación', () => {
  it('correo', () => {
    expect(isValidEmail('a@b.co')).toBe(true);
    expect(isValidEmail('a@b')).toBe(false);
  });
  it('celular colombiano', () => {
    expect(isValidPhone('300 123 4567')).toBe(true);
    expect(isValidPhone('+57 3001234567')).toBe(true);
    expect(normalizePhone('+57 300-123-4567')).toBe('3001234567');
    expect(isValidPhone('12345')).toBe(false);
  });
  it('contraseña', () => {
    expect(passwordError('abc', 'abc')).toMatch(/6/);
    expect(passwordError('abcdef', 'abcdeg')).toMatch(/coinciden/);
    expect(passwordError('abcdef', 'abcdef')).toBeNull();
  });
});

describe('lista local de Colombia', () => {
  it('tiene los 32 departamentos más Bogotá D.C.', () => {
    expect(departamentoNames()).toHaveLength(33);
    expect(ciudadesDe('Bogotá D.C.')).toEqual(['Bogotá']);
    expect(ciudadesDe('Antioquia')).toContain('Medellín');
  });
});
