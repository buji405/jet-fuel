const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const shortHash = require('short-hash');
const validUrl = require('valid-url');

const environment = process.env.NODE_ENV || 'development'
const configuration = require('../knexfile')[environment]
const database = require('knex')(configuration)

app.set('port', process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (request, response) => {

});

app.get('/api/v1/folders', (request, response) => {
  database('folders').select()
    .then(folders => {
      response.status(200).json(folders)
    })
    .catch(error => {
      response.status(500).json({ error })
    });
});

app.get('/api/v1/links', (request, response) => {
  database('links').select()
    .then(links => {
      response.status(200).json(links)
    })
    .catch(error => {
      response.status(500).json({ error })
    });
});

app.post('/api/v1/folders', (request, response) => {
  const newFolder = request.body;

  for (let requiredParameter of ['folderName']) {
    if(!newFolder[requiredParameter]) {
      return response.status(422).json({
        error: `Missing required parameter ${requiredParameter}`
      });
    };
  };

  database('folders').insert(newFolder, 'id')
    .then(folder => {
      response.status(201).json({ id: folder[0] })
    })
    .catch(error => {
      response.status(500).json({ error })
    });
});

app.delete('/api/v1/folders/:id', (request, response) => {
  const id = request.params.id
  database('folders').where('id', id).del()
  .then((res) => response.status(200).json(res))
  .catch(error => {
    response.status(501).json({ error })
  })
})

app.post('/api/v1/links', (request, response) => {
  const newLink = request.body
  newLink.shortURL = shortHash(newLink.origURL)

  if(!validUrl.isWebUri(newLink.origURL)) {
    return response.status(422).json({ error: `Please enter a valid url`})
  }

  for(let requiredParameter of ['origURL', 'description', 'folder_id']) {
    if(!newLink[requiredParameter]) {
      return response.status(422).json({
        error: `Missing required parameter ${requiredParameter}`
      })
    }
  }

  database('links').insert(newLink, '*')
    .then(link => {
      response.status(201).json(link[0])
    })
    .catch(error => {
      response.status(500).json({ error })
    })
})

app.get('/api/v1/folders/:id/links', (request, response) => {
  const id = request.params.id
  database('links').where('folder_id', id).select()
  .then((links) => response.status(200).json(links))
  .catch(error => response.status(404).json(error))
})

app.route('/api/v1/links/:id')
.get((request, response) => {
  database('links').where('id', request.params.id).select()
  .then(link => response.status(302).redirect(link[0].origURL))
  .catch(error => response.status(404).json(error))
})

app.listen(app.get('port'), () => {
  console.log('Express running');
});

module.exports = app
