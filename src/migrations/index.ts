import * as migration_20251204_121656_add_eur_currency from './20251204_121656_add_eur_currency';

export const migrations = [
  {
    up: migration_20251204_121656_add_eur_currency.up,
    down: migration_20251204_121656_add_eur_currency.down,
    name: '20251204_121656_add_eur_currency'
  },
];
