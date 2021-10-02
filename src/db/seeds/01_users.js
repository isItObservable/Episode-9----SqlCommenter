exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('users').del()
  .then(function () {
    // Inserts seed entries
    return knex('users').insert([
      {
        uid: 1,
        email: 'nigel@email.com',
        firstName: 'nigel',
        lastName:'thefist'
      },
      {
        uid: 2,
        email: 'paul@email.com',
        firstName: 'paul',
        lastName:'thesecond'
      },
      {
        uid: 3,
        email: 'robert@email.com',
        firstName: 'robert',
        lastName:'thethird'
      }
    ]);
  });
};