// Direcciones de contratos desplegados. En local usar las del deploy en Anvil.
// En producción (Sepolia) configurar en .env: VITE_FACTORY_ADDRESS, VITE_ORACLE_ADDRESS
export const FACTORY_ADDRESS = import.meta.env.VITE_FACTORY_ADDRESS || '';
export const ORACLE_ADDRESS = import.meta.env.VITE_ORACLE_ADDRESS || '';

// Bloque de despliegue de la factory (para acotar getLogs en RPCs públicas).
// Si es 0/no definido, el frontend intentará igualmente buscar, pero puede ser lento o fallar en algunos RPCs.
export const FACTORY_DEPLOY_BLOCK = Number(import.meta.env.VITE_FACTORY_DEPLOY_BLOCK || 0);
