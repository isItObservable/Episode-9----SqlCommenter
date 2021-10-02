exports.up = function(knex, Promise) {
return knex.schema
    .createTable('users', function(table) {
      table.increments('uid').primary();
      table.string('email').notNullable().unique();
      table.string('firstName');
      table.string('lastName');
    })
    .createTable('posts', function(table){
      table.increments('id').primary();
      table.string('title');
      table.string('body');
      table.integer('author_id')
         .references('uid')
         .inTable('users');
      table.dateTime('postDate').defaultTo(knex.fn.now());
    })
    .createTable('todos', function(table) {
        table.increments('uid').primary();
        table.string('title').notNullable();
        table.boolean('completed').notNullable().defaultTo(false);
      })
}


exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
  return knex.schema.dropTable('posts');
  return knex.schema.dropTable('todos');
}
