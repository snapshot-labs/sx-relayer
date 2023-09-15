import knex from './knex';

export const REGISTERED_TRANSACTIONS = 'registered_transactions';

export async function createTables() {
  const tableExists = await knex.schema.hasTable(REGISTERED_TRANSACTIONS);
  if (tableExists) return;

  return knex.schema.createTable(REGISTERED_TRANSACTIONS, t => {
    t.increments('id').primary();
    t.timestamps().defaultTo(knex.fn.now());
    t.boolean('processed').defaultTo(false).index();
    t.string('network').index();
    t.string('type').index();
    t.string('hash');
    t.json('data');
  });
}

export async function registerTransaction(network: string, type: string, hash: string, data: any) {
  return knex(REGISTERED_TRANSACTIONS).insert({
    network,
    type,
    hash,
    data
  });
}

export async function getTransactionsToProcess() {
  return knex(REGISTERED_TRANSACTIONS).select('*').where({ processed: false });
}

export async function markTransactionProcessed(id: number) {
  return knex(REGISTERED_TRANSACTIONS).update({ processed: true }).where({ id });
}
