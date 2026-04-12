# Guía paso a paso: Conectar wallet y crear una porra (con MockOracle)

Esta guía usa la red local (Anvil) y el MockOracle para simular un partido de principio a fin.

---

## Requisitos previos

- **Anvil** en marcha en una terminal: `anvil`
- **Contratos desplegados** en Anvil (MockOracle + PorraFactory)
- **Frontend** en marcha: `cd frontend` → `npm run dev` → abrir http://localhost:5173
- **MetaMask** instalado en el navegador

---

## Parte 1: Conectar la wallet

### Paso 1.1 – Añadir la red local en MetaMask

**Antes de nada:** Anvil debe estar en marcha. En una terminal ejecuta `anvil` y déjala abierta. Si no está corriendo, MetaMask no podrá conectar y puede mostrar errores como *"Connection header did not include 'upgrade'"*.

1. Abre **MetaMask**.
2. Arriba verás la red actual (ej. "Red principal de Ethereum"). Haz clic ahí.
3. Elige **"Añadir red"** o **"Añadir una red manualmente"**.
4. Rellena **exactamente** (sin espacios extra, sin barra al final):
   - **Nombre de la red:** `Localhost 8545`
   - **URL RPC:** `http://127.0.0.1:8545`  
     - Tiene que ser **http** (no https, no ws).
     - Sin barra final: `http://127.0.0.1:8545` ✓ — `http://127.0.0.1:8545/` ✗
   - **ID de cadena:** `31337`
   - **Símbolo de moneda:** `ETH`
5. Guarda. MetaMask debería cambiar a la red "Localhost 8545".

**Si sale "Connection header did not include 'upgrade'":**

- **Comprueba que Anvil está corriendo:** en otra terminal ejecuta:
  ```powershell
  cast chain-id --rpc-url http://127.0.0.1:8545
  ```
  Si responde `31337`, Anvil está bien. Si da error, inicia Anvil (`anvil`) y vuelve a intentar en MetaMask.
- **Prueba con localhost en lugar de 127.0.0.1:** en la URL RPC pon `http://localhost:8545` (mismo puerto, sin barra al final). En algunos Windows/MetaMask funciona mejor.
- **Asegúrate de no haber puesto `ws://`** (WebSocket). Anvil en local usa HTTP; la URL debe ser `http://`.

### Paso 1.2 – Tener ETH de prueba en tu cuenta de MetaMask

Tienes dos opciones:

**Opción A – Importar una cuenta de Anvil**

Anvil muestra 10 cuentas con claves privadas. Si en MetaMask ves la opción **"Importar cuenta"** (suele estar en Cuentas → Agregar cuenta → Importar cuenta):

1. En la terminal donde corre **Anvil**, busca el bloque **"Private Keys"**. Verás algo como:
   ```
   (0) 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   (1) 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
   ...
   ```
2. En **MetaMask** → **Agregar cuenta** → **Importar cuenta** (o equivalente).
3. Pega la **clave privada** de la cuenta (0) o la que quieras usar.
4. Importa. Esa cuenta tendrá **10 000 ETH** de prueba en la red local.

**Opción B – Enviar ETH ficticios a la cuenta que ya usas en MetaMask**

Si **no** encuentras "Importar cuenta" en tu versión de MetaMask, puedes quedarte con tu cuenta actual y que alguien (o tú desde otra herramienta) le envíe ETH de prueba desde Anvil.

1. En **MetaMask**, con la red **Anvil** seleccionada, copia la **dirección** de tu cuenta (la que empieza por `0x...`).
2. En una **terminal**, desde la raíz del proyecto, con **Anvil en marcha**, ejecuta (sustituye `TU_DIRECCION` por tu dirección):

   **PowerShell:**
   ```powershell
   cast send TU_DIRECCION --value 100ether --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```

   La clave privada es la de la cuenta (0) de Anvil, que tiene 10 000 ETH; así se envían 100 ETH a tu cuenta.
3. Tras unos segundos, en MetaMask (red Anvil) deberías ver el saldo en ETH.

Más detalles y ejemplo en el **README.md**, sección *"Enviar ETH ficticios a una cuenta de MetaMask"*.

### Paso 1.3 – Conectar MetaMask a la DApp

1. Abre la DApp en el navegador: **http://localhost:5173**
2. Arriba a la derecha verás el botón **"Conectar MetaMask"**.
3. Haz clic. MetaMask abrirá una ventana pidiendo:
   - Conectar la cuenta.
   - (A veces) Cambiar a la red "Localhost 8545" si no estabas en ella.
4. Acepta **"Conectar"** y, si sale, **"Cambiar red"**.
5. Cuando esté conectada, en lugar del botón verás tu dirección acortada (ej. `0xf39F...2266`) y el botón **"Desconectar"**.

Ya tienes la wallet conectada a la DApp en local.

---

## Parte 2: Crear una porra

Vamos a crear una porra para un partido ficticio y usar después el MockOracle para simular el resultado.

### Paso 2.1 – Ir a "Crear porra"

1. En el menú de la DApp, haz clic en **"Crear porra"**.
2. Verás el formulario con:
   - Identificador del partido
   - Días hasta fin de apuestas
   - Días hasta fin del partido
   - Participantes (2–4 direcciones)

### Paso 2.2 – Rellenar el formulario

Usa estos valores de ejemplo (o los que prefieras):

| Campo | Valor | Nota |
|-------|--------|------|
| **Identificador del partido** | `atleti-vs-rival` | Guárdalo igual; lo usaremos para el MockOracle. |
| **Días hasta fin de apuestas** | `1` | Las apuestas se aceptan hasta dentro de 1 día. |
| **Días hasta fin del partido** | `2` | El partido “termina” dentro de 2 días (para poder resolver). |
| **Participantes** | 2 direcciones | Deben ser direcciones que controles (ej. 2 cuentas de Anvil). |

**Participantes de ejemplo (cuentas de Anvil):**

- Cuenta (0): `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Cuenta (1): `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`

Si importaste la cuenta (0) en MetaMask, puedes usar esa y la (1). Si quieres 3 o 4 jugadores, añade más direcciones de la lista "Available Accounts" de Anvil.

1. Pega la primera dirección en el primer campo de participante.
2. Pega la segunda en el segundo campo.
3. Comprueba que no haya espacios ni caracteres de más.

### Paso 2.3 – Enviar la transacción

1. Haz clic en **"Crear porra"**.
2. Se abrirá **MetaMask** para confirmar la transacción.
3. Revisa el gas (en local suele ser barato). Pulsa **"Confirmar"**.
4. Espera a que la transacción se confirme (unos segundos en Anvil).
5. En la DApp debería aparecer **"Porra creada correctamente"** y un botón **"Abrir esta porra"**.

### Paso 2.4 – Abrir la porra creada

1. Haz clic en **"Abrir esta porra"** (o ve a **"Mis porras"** y entra en la porra que acabas de crear).
2. Verás la pantalla de detalle:
   - **Estado:** Apuestas
   - **Bote:** 0 ETH (aún no ha apostado nadie)
   - **Participantes y apuestas:** vacío

Ya está creada la porra. El siguiente bloque es apostar y luego simular el partido con el MockOracle.

---

## Parte 3: Apostar (opcional en esta guía)

Para que el ejemplo esté completo:

1. En la pantalla de la porra, con una cuenta que esté en la whitelist (una de las que pusiste como participante), elige una predicción:
   - **Atlético gana**
   - **Empate**
   - **Atlético pierde**
2. Pulsa el botón. MetaMask pedirá **0.001 ETH**. Confirma.
3. Si quieres simular 2 jugadores, cambia en MetaMask a la otra cuenta (importa la cuenta (1) de Anvil si no lo has hecho), conecta de nuevo en la DApp y repite la apuesta con otra predicción.

Cuando tengas al menos 2 apuestas (o al menos 2 jugadores que vayan a apostar), pasamos a simular el partido.

---

## Parte 4: Simular el partido con el MockOracle

En local no hay oráculo real; usamos el **MockOracle**. Tú (como “owner” del oráculo) fijas el resultado del partido. Luego la DApp puede “Resolver con oráculo” y repartir el bote.

### Paso 4.1 – Avanzar el tiempo (para poder resolver)

El contrato solo permite **"Iniciar resolución"** después de la hora de fin del partido. En Anvil el tiempo no pasa solo; lo avanzamos con una llamada RPC.

Abre **PowerShell** en la carpeta del proyecto y ejecuta (ajusta la cantidad de segundos si lo necesitas):

```powershell
# Avanzar ~2 días (172800 segundos) para pasar la fecha de fin del partido
cast rpc evm_increaseTime 172800 --rpc-url http://127.0.0.1:8545
cast rpc evm_mine --rpc-url http://127.0.0.1:8545
```

Así el “reloj” de la blockchain pasa y el contrato considerará que el partido ya ha terminado.

### Paso 4.2 – Iniciar la resolución en la DApp

1. En la pantalla de la porra, verás el botón **"Iniciar resolución"** (visible en fase de apuestas cuando ya haya pasado la hora de fin).
2. Haz clic. Confirma en MetaMask.
3. El estado de la porra pasará a **"Resolviendo"**. El contrato ya ha pedido el resultado al oráculo; ahora hay que decirle al MockOracle cuál es el resultado.

### Paso 4.3 – Fijar el resultado en el MockOracle (simular el partido)

El MockOracle tiene una función `setResult(matchId, resultado)`. Solo la puede llamar el **owner** del contrato MockOracle (quien lo desplegó; en tu caso la cuenta que usaste en el deploy, normalmente la cuenta (0) de Anvil).

En **PowerShell**, desde la raíz del proyecto (`apuestas`):

```powershell
# 1. Calcular el matchId (debe ser el mismo que en el formulario: "atleti-vs-rival")
$matchId = cast keccak "atleti-vs-rival"

# 2. Dirección del MockOracle (la que tienes en frontend/.env como VITE_ORACLE_ADDRESS)
$oracle = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

# 3. Fijar resultado: 0 = Atlético gana, 1 = Empate, 2 = Atlético pierde
cast send $oracle "setResult(bytes32,uint8)" $matchId 0 --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

- Si tu Oracle tiene otra dirección, cambia `$oracle`.
- Si usas otra cuenta como owner del Oracle, cambia `--private-key` por la clave de esa cuenta.
- El último número es el **resultado simulado**: `0` = Atlético gana, `1` = Empate, `2` = Atlético pierde.

Después de esto, el MockOracle ya tiene el resultado guardado para ese `matchId`.

### Paso 4.4 – Resolver con oráculo en la DApp

1. Vuelve a la DApp, a la pantalla de la porra.
2. Deberías ver el botón **"Resolver con oráculo"**.
3. Haz clic y confirma en MetaMask.
4. El estado pasará a **"Reclamando"** y verás el **resultado** (ej. "Atlético gana") y quién puede reclamar.

### Paso 4.5 – Reclamar premios

1. Si apostaste por el resultado correcto, verás el botón **"Reclamar X ETH"**.
2. Haz clic, confirma en MetaMask.
3. Los ETH del bote se envían a tu wallet. Si nadie acertó, cada jugador puede reclamar de vuelta su stake (0.001 ETH).

Con esto has completado el flujo: conectar wallet → crear porra → (apostar) → simular partido con MockOracle → resolver → reclamar.

---

## Resumen rápido (orden de acciones)

| Orden | Dónde | Acción |
|-------|--------|--------|
| 1 | MetaMask | Añadir red Localhost 8545, importar cuenta Anvil. |
| 2 | DApp | Conectar MetaMask. |
| 3 | DApp → Crear porra | Rellenar partido `atleti-vs-rival`, 2 participantes, Crear y confirmar. |
| 4 | DApp | Abrir la porra, apostar 0.001 ETH con 2 cuentas (opcional pero recomendado). |
| 5 | PowerShell | `evm_increaseTime` + `evm_mine` para pasar la fecha del partido. |
| 6 | DApp | En la porra, "Iniciar resolución" y confirmar. |
| 7 | PowerShell | `cast send` al MockOracle: `setResult(matchId, 0)` (o 1 o 2). |
| 8 | DApp | "Resolver con oráculo" y confirmar. |
| 9 | DApp | "Reclamar" para los ganadores (o devolución de stake si no hay ganadores). |

Si en algún paso algo no coincide (direcciones, errores en MetaMask o en la consola del navegador), dime en cuál paso estás y qué ves y lo afinamos.
