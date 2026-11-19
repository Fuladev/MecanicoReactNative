# Mecánico — app React Native (Beta)

App de clientes de Mecánico para **Android e iOS**, hecha con Expo (SDK 58) + TypeScript + Expo Router.
Reemplaza la app Android en Java que está en `../app/` (se conserva solo como referencia durante la migración).

Usa el **mismo proyecto Firebase** (`mecanico-2d3de`), los mismos usuarios y los mismos nodos de Realtime
Database que la app Java y la app de proveedores (`com.mecanico.mecanicoemp`).

## Qué incluye la Beta

| Pantalla | Equivalente en la app Java |
| --- | --- |
| Bienvenida, Iniciar sesión, Crear cuenta | `StartHomeActivity`, `SelectorLogActivity`, `MainActivity`, `CreateCountActivity` |
| Login con Google (Android/iOS) y con Apple (iOS) | `SelectorLogActivity` (solo Google) |
| Completar datos (si falta nombre/celular) | `Datos` |
| Hogar, Motores, Otros servicios | `Home`, `Motors`, `OtrosActivity` |
| Solicitar servicio (una sola pantalla para los 15 servicios) | `servicios/p*Activity` (15 pantallas copiadas) |
| Mis pedidos | `pedidos/MisPedidos` |
| Mis direcciones + agregar/eliminar | `direction/MisDirecciones` |
| Perfil: ver/editar datos, cerrar sesión, eliminar cuenta | `PerfilActivity` |

Desvare y Lavado de autos aparecen como **Próximamente** (en la app Java estaban sin terminar).

## Correcciones respecto a la app Java

- **No se guarda la contraseña** en la base de datos (antes `Users/{uid}/pass` en texto plano).
- **Sin token de API en la app:** departamentos y municipios de Colombia salen de una lista local
  (`src/data/colombia.json`), ya no de `universal-tutorial.com`.
- **Login con Google ya no borra datos:** solo crea `Users/{uid}` si no existe (antes hacía `setValue` y
  borraba nombre, teléfono y direcciones en cada login).
- **`Tipo` correcto** para Belleza (`Belleza`), Máquinas de coser (`MCoser`), Maquinaria pesada
  (`MAmarilla`) y Computadores (`Equipos`), que antes se guardaban como `Lav.` / `Comp.`.
- **Un solo ID por pedido:** se escribe `Pedidos/{id}` y `Pedido/{uid}/{id}` con el mismo ID, en una sola
  escritura atómica (`update` multi-ruta).
- **Fechas ordenables:** además de `date` (texto legacy) se guarda `createdAt` (timestamp). "Mis pedidos" se
  ordena cronológicamente, incluso para los pedidos antiguos.
- **Direcciones:** `dirComplete` se arma con el texto del formulario y siempre se guarda `name`. Las
  direcciones antiguas dañadas o sin nombre se leen sin que la app se caiga.
- **Sesión persistente:** ya no se cierra sesión al abrir la app, y no hay excepciones lanzadas a propósito.
- **Eliminar cuenta** desde Perfil (requisito de App Store y Google Play).
- **Sign in with Apple** en iOS (requisito de App Store cuando se ofrece login con Google).

### Contrato de datos (compatibilidad con la app de proveedores)

Ver `src/domain/schema.ts`. Los campos legacy se escriben igual que antes (`name, apel, mail, cel, dir, ciu,
barr, des, marca, Tipo, date, id, mecanico, state`). Los campos nuevos se agregan **además**:
`pedidoId, servicio, createdAt, estado, direccionId`. La app de proveedores puede ignorarlos.

## Correr la app

Requisitos: Node 20+, y Android Studio (Android) o Xcode (iOS, solo en Mac). Login con Google/Apple usa
módulos nativos, así que **no funciona en Expo Go**: hace falta un *development build*.

```bash
cd mobile
npm install
npx expo run:android      # o: npx expo run:ios
```

Sin Android Studio/Xcode, con EAS (cuenta gratuita de Expo):

```bash
npx eas-cli@latest login
npx eas-cli@latest build --profile preview --platform android   # APK para instalar en teléfonos de prueba
npx eas-cli@latest build --profile development --platform ios   # requiere cuenta Apple Developer
```

Verificaciones:

```bash
npm run typecheck && npm run lint && npm test
```

## Identificadores de la app

- Android: `com.mecanico.mecanicoapp` (el mismo de Play Store), `versionCode` 22 (la app Java va en 21).
  Para publicar como actualización hay que firmar con la **misma clave de subida** de Play Console.
- iOS: `com.mecanicoapp.MecanicoApp` (el que ya está registrado en Firebase).

## Pendiente antes de publicar (necesita acción del equipo)

1. **Rotar el token de `universal-tutorial.com`** que quedó en `CreateCountActivity.java` y en el historial de
   git. La app nueva ya no lo usa.
2. **Google Sign-In en Android:** registrar en Firebase (app `com.mecanico.mecanicoapp`) el SHA-1 de la
   clave con la que se firme la build (la de EAS o la de Play App Signing).
3. **Google Sign-In en iOS / Apple:** activar el proveedor *Apple* en Firebase Authentication y la capacidad
   *Sign in with Apple* en el App ID (EAS lo hace solo si tiene acceso a la cuenta Apple Developer).
4. **Reglas de seguridad** (`../firebase/database.rules.json`): están listas pero **no desplegadas**. Antes
   de desplegarlas hay que confirmar cómo se autentica la app de proveedores (las reglas esperan un nodo
   `Proveedores/{uid}`), y tener en cuenta que bloquean el campo `pass`, así que la app Java vieja ya no podrá
   registrar usuarios cuando se desplieguen.
5. **Limpieza de datos** (`../firebase/scripts/limpieza-datos.mjs`): simulación por defecto, `--apply` para
   escribir. Necesita una clave de cuenta de servicio. Borra `pass`, corrige direcciones y `Tipo: "Comp."`, y
   agrega `createdAt`. La copia de seguridad que genera contiene datos personales: bórrala al terminar.
6. El archivo `app/release/app-release.aab` se quitó del repositorio en esta rama, pero sigue en el historial
   de `master`.

## Estructura

```
src/
  app/            rutas (Expo Router): (auth), (tabs), servicio/[code], direcciones/nueva, perfil/editar…
  components/     UI reutilizable (botones, campos, selector con búsqueda, formulario de dirección…)
  config/         Firebase
  context/        sesión y perfil del usuario
  data/           departamentos y municipios de Colombia
  domain/         catálogo de servicios, esquema de datos, armado de pedidos y direcciones (con tests)
  services/       acceso a Firebase (auth, usuarios, pedidos)
```
