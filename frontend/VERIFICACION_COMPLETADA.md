# Verificación completada (flujo ejecutado en local)

Se ha ejecutado el flujo completo contra Anvil vía `cast`:

1. **Porra creada** con 2 participantes (cuentas Anvil 0 y 1).
2. **Apuestas:** cuenta 0 → Atlético gana (0), cuenta 1 → Empate (1). Bote: 0.002 ETH.
3. **Tiempo avanzado** hasta después del partido.
4. **Resolución:** inicio, resultado oráculo = 0 (Atlético gana), `resolveWithOracle`.
5. **Reclamación:** cuenta 0 (ganadora) reclamó 0.002 ETH.

## Dirección de la porra para abrir en la DApp

Pega esta dirección en **Inicio → Acceder a una porra por dirección** y pulsa **Ir a la porra**:

```
0x9f1ac54BEF0DD2f6f3462EA0fa94fC62300d3a8e
```

O abre directamente en el navegador (con el frontend en http://localhost:5173):

http://localhost:5173/porra/0x9f1ac54BEF0DD2f6f3462EA0fa94fC62300d3a8e

---

**Estado del contrato:** Finalizado (3). Resultado: Atlético gana. El ganador ya reclamó el bote.
