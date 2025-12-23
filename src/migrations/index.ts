import * as migration_20251204_121656_add_eur_currency from './20251204_121656_add_eur_currency';
import * as migration_20251223_231748 from './20251223_231748';

export const migrations = [
  {
    up: migration_20251204_121656_add_eur_currency.up,
    down: migration_20251204_121656_add_eur_currency.down,
    name: '20251204_121656_add_eur_currency',
  },
  {
    up: migration_20251223_231748.up,
    down: migration_20251223_231748.down,
    name: '20251223_231748'
  },
];
