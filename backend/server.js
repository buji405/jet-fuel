const express = require('express');  //requires the Express module that was installed via NPM
const app = express(); //sets up the Express application
const path = require('path'); //part of letting you access the absolute path
const bodyParser = require('body-parser'); //need for parsing the body of posts
const shortHash = require('short-hash'); //npm package for url shortener
const validUrl = require('valid-url'); //npm package for validating urls

const environment = process.env.NODE_ENV || 'development' //sets the environment to dev or product etc..
const configuration = require('../knexfile')[environment] //for the test environment
const database = require('knex')(configuration) //runs knex function and passes it the test environment

app.set('port', process.env.PORT || 3000); //dynamic port, either localhost or for your heroku address
app.use(bodyParser.json()); //for every request run body parser so it can read the body on posts
app.use(bodyParser.urlencoded({ extended: true })) //parses full objects
app.use(express.static(path.join(__dirname, 'public')));
//app.use() says for every request to the server, always run the function passed into app.use()
//In this case we’re saying, for every request to the server, make sure to use the specified path as a starting point for all static asset files.
//path.join(__dirname, 'public') part is the absolute path of the public directory, and __dirname is a variable that holds the directory of the current Node application

app.get('/', (request, response) => {

});
//the home endpoint where everything is rendered

app.get('/api/v1/folders', (request, response) => {
  database('folders').select()
    .then(folders => {
      response.status(200).json(folders)
    })
    .catch(error => {
      response.status(500).json({ error })
    });
});
//get request routing to folders endpoint, pass folders table to database, give it response status 200 if success or 500 if error

app.get('/api/v1/links', (request, response) => {
  database('links').select()
    .then(links => {
      response.status(200).json(links)
    })
    .catch(error => {
      response.status(500).json({ error })
    });
});

//get request routing to links endpoint, pass links table to database, give it response status 200 if success or 500 if error

app.post('/api/v1/folders', (request, response) => {
  const newFolder = request.body;

  for (let requiredParameter of ['folderName']) {
    if(!newFolder[requiredParameter]) {
      return response.status(422).json({
        error: `Missing required parameter ${requiredParameter}`
      });
    };
  };

  //post request routing to folders endpoint, enter in required properties, return error if anything required is missing.

  database('folders').insert(newFolder, 'id')
    .then(folder => {
      response.status(201).json({ id: folder[0] })
    })
    .catch(error => {
      response.status(500).json({ error })
    });
});

//pass folders table to database, pass in the new folder and id. give it response status 201 and id if success, or 500 if error

app.delete('/api/v1/folders/:id', (request, response) => {
  const id = request.params.id
  database('folders').where('id', id).del()
  .then((res) => response.status(200).json(res))
  .catch(error => {
    response.status(501).json({ error })
  })
})

//delete request to folders endpoint, pass db the folders table and id, run delete method. if success give status of 200, or 501 if error

app.post('/api/v1/links', (request, response) => {
  const newLink = request.body
  newLink.shortURL = shortHash(newLink.origURL)

  if(!validUrl.isWebUri(newLink.origURL)) {
    return response.status(422).json({ error: `Please enter a valid url`})
  }
  //post request routing to links endpoint, enter in required properties, return error if anything required is missing.

  for(let requiredParameter of ['origURL', 'description', 'folder_id']) {
    if(!newLink[requiredParameter]) {
      return response.status(422).json({
        error: `Missing required parameter ${requiredParameter}`
      })
    }
  }

  //setting more required parameters of description, url and folderid

  database('links').insert(newLink, '*')
    .then(link => {
      response.status(201).json(link[0])
    })
    .catch(error => {
      response.status(500).json({ error })
    })
})

//pass links table to db and insert new link, if success 201 status, 500 status if error

app.get('/api/v1/folders/:id/links', (request, response) => {
  const id = request.params.id
  database('links').where('folder_id', id).select()
  .then((links) => response.status(200).json(links))
  .catch(error => response.status(404).json(error))
})

//get request to links in a certain folder endpoint, pass links table to db and connect with the foreign key. return appropriate status depending on success or error.

app.route('/api/v1/links/:id')
.get((request, response) => {
  database('links').where('id', request.params.id).select()
  .then(link => response.status(302).redirect(link[0].origURL))
  .catch(error => response.status(404).json(error))
})

//routes to link endpoint, passes links table to db, returns 302 if success then redirects to link at index 0 with original url tacked on

app.listen(app.get('port'), () => {
  console.log('Express running');
});
//tells the server to start listening for connections on port localhost 3000

module.exports = app 
