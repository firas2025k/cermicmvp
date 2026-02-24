import * as migration_20251204_121656_add_eur_currency from './20251204_121656_add_eur_currency';
import * as migration_20251223_231748 from './20251223_231748';
import * as migration_20260224_000001_add_header_logo from './20260224_000001_add_header_logo';

export const migrations = [
  {
    up: migration_20251204_121656_add_eur_currency.up,
    down: migration_20251204_121656_add_eur_currency.down,
    name: '20251204_121656_add_eur_currency',
  },
  {
    up: migration_20251223_231748.up,
    down: migration_20251223_231748.down,
    name: '20251223_231748',
  },
  {
    up: migration_20260224_000001_add_header_logo.up,
    down: migration_20260224_000001_add_header_logo.down,
    name: '20260224_000001_add_header_logo',
  },
];
