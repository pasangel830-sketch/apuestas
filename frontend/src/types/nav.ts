import type { MouseEvent } from 'react';

/** Item de navegación enlazado a una ruta de React Router. */
export interface NavRouteItem {
  kind: 'route';
  label: string;
  to: string;
  end?: boolean;
}

/** Item que ejecuta una acción (p. ej. scroll) en lugar de solo cambiar de ruta. */
export interface NavActionItem {
  kind: 'action';
  label: string;
  onActivate: (e: MouseEvent<HTMLAnchorElement>) => void;
}

export type TopBarNavEntry = NavRouteItem | NavActionItem;
