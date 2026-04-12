# Entorno local a cero (PowerShell + Anvil + Vite)

Resumen para **reiniciar todo desde cero** en Windows con **PowerShell**. La guía larga sigue en [README.md](./README.md) y el paso a paso detallado en [GUIA_PASO_A_PASO.md](./GUIA_PASO_A_PASO.md).

---

## Puertos y rutas

| Servicio | Puerto | URL / RPC |
|----------|--------|-----------|
| **Anvil** | `8545` | `http://127.0.0.1:8545` |
| **Vite** | `5173` | `http://localhost:5173` |
| **Chain ID** | — | `31337` |

Raíz del proyecto (ejemplo):

```text
C:\Proyectos\Master BlockChain\apuestas
```

---

## Tres terminales PowerShell

Abre **3 ventanas** de PowerShell (o pestañas). Todas con `cd` a la raíz salvo la del frontend.

### Terminal 1 — Anvil (blockchain local)

```powershell
cd "C:\Proyectos\Master BlockChain\apuestas"

# Si el puerto 8545 está ocupado, cierra el proceso (sustituye PID por el que salga en netstat)
# netstat -ano | Select-String ":8545"
# Stop-Process -Id <PID> -Force

cd "C:\Proyectos\Master BlockChain\apuestas"
anvil
```

Deja esta terminal **abierta**. La primera cuenta de Anvil tiene 10 000 ETH de prueba; su clave privada es la que lista `anvil` al arrancar (típicamente empieza por `0xac0974...`).

---

### Terminal 2 — Desplegar contratos

Con Anvil ya en marcha:

```powershell
cd "C:\Proyectos\Master BlockChain\apuestas"
forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

Anota las dos direcciones que imprime el script, por ejemplo:

```text
MockOracle:    0x5FbDB2315678afecb367f032d93F642f64180aa3
PorraFactory:  0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

**Importante:** cada vez que **reinicias Anvil**, el estado se borra. Debes **volver a ejecutar este deploy** y **actualizar** `frontend/.env` con las nuevas direcciones (a veces coinciden con las de arriba, a veces no: copia siempre las del log).

---

### Terminal 3 — Frontend (Vite)

1. Edita `frontend/.env` (créalo si no existe):

```env
VITE_FACTORY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_ORACLE_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
VITE_USE_LOCAL_CHAIN=true
```

2. Arranca Vite:

```powershell
cd "C:\Proyectos\Master BlockChain\apuestas\frontend"

# Si 5173 está ocupado:
# netstat -ano | Select-String ":5173"
# Stop-Process -Id <PID> -Force


cd "C:\Proyectos\Master BlockChain\apuestas\frontend"
npm run dev -- --port 5173
```

Abre **http://localhost:5173**.

---

# Terminal 4

```powershell
cd "c:\Proyectos\Master BlockChain\apuestas\frontend"
npm run dev:api
npm run dev -- --port 5173
```


## Comprobación rápida (opcional)

```powershell
# ¿Hay bytecode en la factory? (no debe salir solo "0x")
cast code <PORRA_FACTORY> --rpc-url http://127.0.0.1:8545

# ¿Hay bytecode en el oráculo?
cast code <MOCK_ORACLE> --rpc-url http://127.0.0.1:8545

# Último bloque (Anvil responde)
cast block latest --rpc-url http://127.0.0.1:8545 --field number
```

Si `cast code` devuelve `0x`, esa dirección **no tiene contrato** (deploy no hecho o `.env` apunta a direcciones viejas tras reiniciar Anvil).

---

## Enviar ETH de prueba a tus cuentas MetaMask

Desde la **raíz** del proyecto (usa la misma `--private-key` que la cuenta 0 de Anvil):

```powershell
cast send 0xTU_DIRECCION --value 100ether --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

---

## Avanzar tiempo en Anvil (simular días)

```powershell
cast rpc evm_increaseTime 172800 --rpc-url http://127.0.0.1:8545   # 2 días en segundos
cast rpc evm_mine --rpc-url http://127.0.0.1:8545
```

Comprueba el efecto:

```powershell
cast block latest --rpc-url http://127.0.0.1:8545 --field timestamp
```

---

## MockOracle: resultado y owner

- **Valores de `setResult`:** `0` = Atlético gana · `1` = Empate · `2` = Atlético pierde.
- **Owner del oráculo:** quien desplegó el contrato (en deploy típico con cuenta 0 de Anvil):

```powershell
cast call <MOCK_ORACLE> "owner()(address)" --rpc-url http://127.0.0.1:8545
```

Solo el **owner** puede llamar `setResult`.

### `setResult` sin pegar private key en el comando (impersonación Anvil)

```powershell
cast rpc anvil_impersonateAccount 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --rpc-url http://127.0.0.1:8545

cast send <MOCK_ORACLE> "setResult(bytes32,uint8)" <MATCH_ID_BYTES32> 0 --from 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --unlocked --rpc-url http://127.0.0.1:8545
```

Sustituye `<MATCH_ID_BYTES32>` por el `matchId` que muestra la pantalla de la porra (o `cast keccak "tu-texto-del-partido"` si usas el mismo texto que al crear la porra).

---

## Problemas frecuentes

| Síntoma | Causa habitual | Qué hacer |
|--------|----------------|-----------|
| “Porra creada” pero no aparece en **Mis porras** / no hay enlace | `.env` con factory sin contrato o Anvil reiniciado sin redeploy | `cast code` a la factory; redeploy + actualizar `.env` + reiniciar Vite |
| `resolveWithOracle` falla | Oráculo equivocado o `matchId` distinto al de la porra | Usar `VITE_ORACLE_ADDRESS` del deploy actual y el `matchId` de esa porra |
| Reparto “raro” | Confusión 0/1/2 | `0` gana, `1` empate, `2` pierde |
| `Ownable: caller is not the owner` en `setResult` | Firmas con una cuenta que no es owner | Usar cuenta owner o `anvil_impersonateAccount` + `--from` owner |

---

## Tests y build (verificar que no se rompió el código)

```powershell
cd "C:\Proyectos\Master BlockChain\apuestas"
forge test

cd frontend
npm run build
```

---

## Orden recomendado para “todo a cero”

1. Cerrar procesos viejos en `8545` y `5173` si hace falta (`Stop-Process` + `netstat`).
2. **Terminal 1:** `anvil`
3. **Terminal 2:** `forge script ...Deploy...`
4. Actualizar `frontend/.env` con las direcciones del log.
5. **Terminal 3:** `npm run dev -- --port 5173`
6. MetaMask: red `31337`, RPC `127.0.0.1:8545`, financiar cuentas con `cast send` si hace falta.
7. Crear porra de nuevo (el estado anterior de Anvil ya no existe).

---

*Documento generado para el flujo local en PowerShell; producción y seguridad de claves: ver [README.md](./README.md).*
