const express = require('express');  //requires the Express module that was installed via NPM
const app = express(); //sets up the Express application
const path = require('path'); //part of letting you access the absolute path
const bodyParser = require('body-parser');
const shortHash = require('short-hash');

const environment = process.env.NODE_ENV || 'development'
const configuration = require('./knexfile')[environment]
const database = require('knex')(configuration)

app.set('port', process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')));
//app.use() says for every request to the server, always run the function passed into app.use()
//In this case we’re saying, for every request to the server, make sure to use the specified path as a starting point for all static asset files.
//path.join(__dirname, 'public') part is the absolute path of the public directory, and __dirname is a variable that holds the directory of the current Node application

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
  console.log(id);
  database('links').where('folder_id', id).select()
  .then((links) => response.status(200).json(links))
})

//creates a route handler to listen for GET requests from a client. The first argument in this function is the route path. Listening for get requests on localhost:3000/.
//The request object contains information about the request that came from the client (request headers, query parameters, request body, etc.). The response object contains information that we want
//to send as a response back to the client


app.listen(app.get('port'), () => {
  console.log('Express running');
});
//tells the server to start listening for connections on port localhost 3000, see to log express running in terminal

module.exports = app
