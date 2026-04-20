# Decentralized Porra

App de apuestas descentralizadas.

Sistema descentralizado de gestión de porras para partidos de fútbol (perspectiva Atlético de Madrid), con arquitectura modular, creación permissionless de juegos y resolución mediante oráculo.

**Stack:** Solidity, Foundry (backend), React + Vite (frontend), Vercel (despliegue web).

**Windows 11:** Las instrucciones de “Ejecución en local” incluyen comandos compatibles con **PowerShell** (terminal por defecto en Windows). Donde haya diferencias se indica la versión para Windows.

**Guía detallada:** Para un ejemplo completo (conectar wallet, crear porra, simular partido con MockOracle), ver **[GUIA_PASO_A_PASO.md](./GUIA_PASO_A_PASO.md)**.

**Reinicio rápido (3 terminales, `.env`, trucos Anvil):** **[README_ENTORNO_LOCAL.md](./README_ENTORNO_LOCAL.md)**.

---

## Estructura del proyecto

- `src/` – Contratos Solidity (PorraGame, WhitelistManager, PorraFactory, MockOracle)
- `script/` – Script de despliegue
- `test/` – Tests Foundry
- `frontend/` – DApp React (conexión MetaMask, crear porras, apostar, reclamar)

---

## Ejecución en local (paso a paso)

**Nota Windows 11:** Usa **PowerShell** (terminal integrada de VS Code o Windows Terminal). Si la ruta del proyecto tiene espacios (p. ej. `Master BlockChain`), envuélvela en comillas: `cd "C:\Proyectos\Master BlockChain\apuestas"`.

### Requisitos

- Node.js 18+
- [Foundry](https://book.getfoundry.sh/getting-started/installation) (forge, anvil)
- MetaMask (o otra wallet compatible)

### 1. Clonar e instalar

Desde la carpeta del proyecto (por ejemplo `apuestas`):

**PowerShell (Windows 11):**
```powershell
cd "C:\Proyectos\Master BlockChain\apuestas"
cd frontend; npm install; cd ..
```

**Bash / Git Bash:**
```bash
cd apuestas
cd frontend && npm install && cd ..
```

### 2. Compilar y tests (contratos)

```bash
forge build
forge test
```

### 3. Levantar blockchain local (Anvil)

En una terminal:

```bash
anvil
```

Deja esta terminal abierta. Anvil crea 10 cuentas con ETH de prueba y RPC en `http://127.0.0.1:8545` (chain id 31337).

### 4. Desplegar contratos en Anvil

En **otra** terminal (PowerShell o CMD), desde la raíz del proyecto:

```powershell
forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

En Windows, si estás en una ruta con espacios, navega antes con: `cd "C:\Proyectos\Master BlockChain\apuestas"`.

(La clave privada es la primera cuenta por defecto de Anvil.)

En la salida verás algo como:

```
MockOracle: 0x5FbDB2315678afecb367f032d93F642f64180aa3
PorraFactory: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

### 5. Configurar el frontend para local

En `frontend/` crea un archivo `.env`:

```env
VITE_FACTORY_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
VITE_ORACLE_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_USE_LOCAL_CHAIN=true
```

(Sustituye por las direcciones que te haya mostrado el script de deploy.)

### 6. Arrancar el frontend

**PowerShell (Windows 11):**
```powershell
cd frontend
npm run dev
```

**Bash:**
```bash
cd frontend
npm run dev
```

Abre la URL que indique Vite (p. ej. `http://localhost:5173`).

### 7. Conectar MetaMask a Anvil

- Red: añadir red personalizada  
  - RPC: `http://127.0.0.1:8545`  
  - Chain ID: `31337`
- Importar una de las cuentas de Anvil (clave privada de la lista que muestra `anvil`) para tener ETH y ser el “owner” del oráculo si usas la primera cuenta.

#### Enviar ETH ficticios a una cuenta de MetaMask (alternativa a importar)

Si en tu versión de MetaMask no aparece la opción **“Importar cuenta”**, puedes usar la cuenta que ya tienes y **enviarle ETH de prueba** desde la primera cuenta de Anvil (que tiene 10 000 ETH por defecto). Así no necesitas importar ninguna clave privada.

**Requisitos:** Anvil en marcha (`anvil` en una terminal) y tener la **dirección** de tu cuenta de MetaMask (la que empieza por `0x...`, en la red Anvil).

**Desde la raíz del proyecto** (PowerShell), ejecuta (sustituye `TU_DIRECCION_METAMASK` por tu dirección real):

```powershell
cast send TU_DIRECCION_METAMASK --value 100ether --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

- **`TU_DIRECCION_METAMASK`**: la dirección de la cuenta que quieres financiar (cópiala desde MetaMask, p. ej. al pulsar “Recibir” o sobre tu dirección).
- **`100ether`**: cantidad de ETH ficticios a enviar (puedes poner `10ether`, `500ether`, etc.).
- **`--private-key 0xac0974...`**: clave privada de la **cuenta (0)** de Anvil, que es la que tiene los 10 000 ETH de prueba. Así esa cuenta “paga” el envío a tu MetaMask.

**Ejemplo** (si tu dirección es `0xe53624846D4a7eE47f92a3D30Cc2C73F496b28E6`):

```powershell
cast send 0xe53624846D4a7eE47f92a3D30Cc2C73F496b28E6 --value 100ether --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

Tras confirmar que la transacción se ha minado, en MetaMask (red Anvil, esa cuenta) deberías ver el saldo en ETH. A partir de ahí puedes conectar esa cuenta a la DApp y usarla para crear porras y apostar.

### 8. Verificación: MetaMask y primera porra

Sigue estos pasos para comprobar que todo funciona:

1. **Abrir la DApp:** en el navegador ve a **http://localhost:5173/** (con el frontend en marcha).
2. **Añadir red en MetaMask:**
   - MetaMask → Redes → Añadir red / Añadir una red manualmente.
   - Nombre: `Localhost 8545`
   - URL RPC: `http://127.0.0.1:8545`
   - ID de cadena: `31337`
   - Moneda: ETH → Guardar.
3. **Importar cuenta de Anvil:** en MetaMask → Importar cuenta → pegar la clave privada de una cuenta de Anvil (p. ej. la primera: `0xac0974...f2ff80`). Esa cuenta tendrá 10 000 ETH de prueba.
4. **Conectar:** en la DApp, clic en **Conectar MetaMask**. Acepta la conexión y el cambio de red si te lo pide.
5. **Crear una porra:** menú **Crear porra**. Rellena:
   - Identificador del partido: p. ej. `atleti-vs-rival` (guárdalo para fijar el resultado del oráculo después).
   - Días hasta fin de apuestas: `1`
   - Días hasta fin del partido: `2`
   - Participantes: **2 direcciones** (p. ej. la cuenta que usas y otra de Anvil: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`, `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`).
   - Clic en **Crear porra** y confirma en MetaMask.
6. **Abrir la porra:** tras confirmar, aparecerá el enlace **Abrir esta porra**; o ve a **Mis porras** y entra en la porra creada.
7. **Apostar:** con una cuenta que esté en la whitelist, elige una predicción (Atlético gana / Empate / Atlético pierde) y envía 0.001 ETH. Confirma en MetaMask. Repite con la segunda cuenta si quieres.
8. **Acceder por dirección:** en la **Inicio** puedes pegar la dirección del contrato de la porra (0x...) y clic en **Ir a la porra** para abrirla sin pasar por “Mis porras”.

### 9. Flujo de uso en local (resumen)

1. Conectar wallet en la DApp.
2. **Crear porra:** “Crear porra” → rellenar participantes (2–4 direcciones), identificador del partido, plazos → Crear porra.
3. **Apostar:** Ir a “Mis porras” o abrir el enlace de la porra. Cada participante (cuenta en la whitelist) puede apostar 0.001 ETH eligiendo: Atlético gana (0), Empate (1), Atlético pierde (2).
4. **Resolver:** Pasada la hora de fin de partido, cualquier usuario puede llamar “Iniciar resolución”. Como en local usas **MockOracle**, el owner del oráculo debe fijar el resultado (en un contrato MockOracle llamando `setResult(matchId, 0|1|2)`). Luego en la DApp: “Resolver con oráculo”.
5. **Reclamar:** Los ganadores ven el botón “Reclamar” y cobran su parte del bote.

**Fijar resultado del oráculo en local (MockOracle):** el creador de la porra usa un `matchId` que es el hash del texto del partido (p. ej. "atleti-vs-rival"). Para que "Resolver con oráculo" funcione, el **owner del contrato MockOracle** debe llamar primero a `setResult(matchId, 0|1|2)`.

**PowerShell (Windows 11)** – en dos pasos (evita problemas con la sustitución de comandos):

```powershell
# 1. Obtener el hash del partido (usa el mismo texto que en "Crear porra")
$matchId = cast keccak "atleti-vs-rival"

# 2. Fijar resultado (sustituye ORACLE_ADDRESS por la dirección de tu MockOracle)
cast send ORACLE_ADDRESS "setResult(bytes32,uint8)" $matchId 0 --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

El `0` al final es el resultado: **0** = Atlético gana, **1** = Empate, **2** = Atlético pierde.

**Bash / Git Bash** (en una sola línea):

```bash
cast send ORACLE_ADDRESS "setResult(bytes32,uint8)" $(cast keccak "atleti-vs-rival") 0 --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

---

## Despliegue en la web (producción)

Orden recomendado: **1) contratos en Sepolia** (obtienes direcciones) → **2) Vercel (frontend + /api serverless)** (Postgres en Neon + endpoints).

### 1. Contratos (Sepolia)

Variables típicas: `PRIVATE_KEY` (o pasar `--private-key`), `SEPOLIA_RPC_URL` (o sustituir en el comando).

```powershell
forge script script/Deploy.s.sol --rpc-url $env:SEPOLIA_RPC_URL --broadcast --private-key $env:PRIVATE_KEY
```

(Anota `MockOracle` y `PorraFactory` de la salida. El desplegador es **owner** de `MockOracle`: esa misma clave debe usarse como `ORACLE_PRIVATE_KEY` si vas a exponer endpoints que firmen transacciones.)

La cuenta del oráculo necesita **ETH de Sepolia** para pagar el gas de las transacciones que firma la API (`/api/oracle/fulfill`).

### 2. Deploy en Vercel (frontend + /api serverless)

1. **New Project** → importar el repo.
2. **Root Directory:** (raíz del repo).
3. **Build Command:** usa `vercel.json` (construye `frontend`).
4. **Output Directory:** usa `vercel.json` (`frontend/dist`).
5. Variables (Project Settings → Environment Variables):
   - `DATABASE_URL` — conexión Postgres (Neon).
   - `VITE_FACTORY_ADDRESS` — `PorraFactory` en Sepolia.
   - `VITE_ORACLE_ADDRESS` — `MockOracle` en Sepolia.
   - `ORACLE_ADDRESS`, `ORACLE_PRIVATE_KEY`, `ORACLE_RPC_URL`, `ORACLE_CHAIN_ID` — si vas a usar endpoints que escriben en cadena.

El frontend llama siempre a rutas relativas `/api/...` (mismo origen en Vercel).

Para producción real querrías sustituir `MockOracle` por un oráculo tipo Chainlink enlazado a una API de resultados.

---

## Resumen de contratos

| Contrato            | Función principal                                                |
|---------------------|------------------------------------------------------------------|
| **PorraGame**       | Una porra: apuestas, bote, estados (Betting → Resolving → Claiming → Finished), resolución y reclamación. |
| **WhitelistManager**| Gestiona 2–4 participantes autorizados por porra.                 |
| **PorraFactory**    | Despliega WhitelistManager + PorraGame y las registra.          |
| **MockOracle**      | En desarrollo: el owner fija el resultado (0/1/2) manualmente.  |

Stake fijo: **0.001 ETH**. Resultados: **0** = Atlético gana, **1** = Empate, **2** = Atlético pierde.

---

## Tests

```bash
forge test
```

Cobertura de flujos: whitelist, apuestas, resolución con oráculo, resolución manual, reclamación, doble reclamación, restricciones de estado y participantes.

## Variables de entorno necesarias

Crea `frontend/.env.local` con:

VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/TU_API_KEY

Para obtener una API key gratuita: https://dashboard.alchemy.com
(El endpoint `demo` de Alchemy funciona para pruebas pero tiene límites)

## Desarrollo local con Vercel

Recomendado (sirve frontend + funciones serverless):

```bash
npm i -g vercel
vercel dev
```

Comprobaciones rápidas:

```bash
curl -i http://127.0.0.1:3000/api/health
curl -i http://127.0.0.1:3000/api/sports/matches
curl -i -X POST http://127.0.0.1:3000/api/sports/matches -H "Content-Type: application/json" -d "{\"id\":\"match-1\",\"label\":\"Test\"}"
curl -i -X DELETE http://127.0.0.1:3000/api/sports/matches -H "Content-Type: application/json" -d "{\"id\":\"match-1\"}"
```
