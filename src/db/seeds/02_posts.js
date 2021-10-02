exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('posts').del()
  .then(function () {
    // Inserts seed entries
    return knex('posts').insert([
      {
        id: 1,
        title: 'The First Blog Post of this website',
        body:  'Logging has always been a good development practice because it gives us insights and information on what happens during the execution of our code. We have often used logs  to diagnose an issue or an error.\n Because of the nature of the information',
        author_id: 1
      }
    ]);
  });
};