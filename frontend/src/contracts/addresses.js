// Direcciones de contratos desplegados. En local usar las del deploy en Anvil.
// En producción (Sepolia) configurar en .env: VITE_FACTORY_ADDRESS, VITE_ORACLE_ADDRESS
export const FACTORY_ADDRESS = import.meta.env.VITE_FACTORY_ADDRESS || '';
export const ORACLE_ADDRESS = import.meta.env.VITE_ORACLE_ADDRESS || '';
