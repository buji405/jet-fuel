exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('links').del()
  .then(() => knex('folders').del())

    .then(() => {
      return Promise.all([
        knex('folders').insert({
          folderName: 'Concerts'
        }, 'id')
        .then(folder => {
          return knex('links').insert([
            { description: "Tours", origURL: 'http://www.google.com', shortURL: 'a11bd358', folder_id: folder[0] },
            { description: "Tickets", origURL: 'http://www.ticketmaster.com', shortURL: 'a11bd732', folder_id: folder[0] }
          ])
        })
        .then(() => console.log('Seeding complete!'))
        .catch(error => console.log(`Error seeding data: ${error}`))
      ])
    })
    .then(() => {
      return Promise.all([
        knex('folders').insert({
          folderName: 'Dogs'
        }, 'id')
        .then(folder => {
          return knex('links').insert([
            { description: "Training", origURL: 'http://noblebeastdogtraining.com', shortURL: 'b11ed358', folder_id: folder[0] },
            { description: "Food", origURL: 'http://www.chewy.com', shortURL: 'a11br432', folder_id: folder[0] },
            { description: "Parks", origURL: 'https://www.yelp.com', shortURL: 'a11br432', folder_id: folder[0] }
          ])
        })
        .then(() => console.log('Seeding complete!'))
        .catch(error => console.log(`Error seeding data: ${error}`))
      ])
    })
    .catch(error => console.log(`Error seeding data: ${error}`))
};
