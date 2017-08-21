process.env.NODE_ENV = 'test'

const environment = process.env.NODE_ENV || 'development';
const configuration = require('../../knexfile')[environment];
const database = require('knex')(configuration);
const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../server');

chai.use(chaiHttp)

describe('Client Routes', () => {
  it('should return the homepage with text', (done) => {
    chai.request(server)
    .get('/')
    .end((err, response) => {
      response.should.have.status(200)
      response.should.be.html

      done()
    })
  })
});

describe('API Routes', () => {

  beforeEach((done) => {
    database.migrate.rollback()
    .then(() => {
      database.migrate.latest()
      .then(() => {
        database.seed.run()
        .then(() => {
          done()
        })
      })
    })
  })

  describe('GET /api/v1/folders', () => {
    it('should return all of the folders', (done) => {
      chai.request(server)
      .get('/api/v1/folders')
      .end((err, response) => {
        response.should.have.status(200)
        response.should.be.json
        response.body.should.be.a('array')
        response.body.length.should.equal(2)
        response.body[0].should.have.property('folderName')
        response.body[0].folderName.should.equal('Concerts')

        done()
      })
    })
    it('should return a 404 error if you go to the wrong endpoint', (done) => {
      chai.request(server)
      .get('/api/v1/foldr')
      .end((error, response) => {
        response.should.have.status(404)

        done()
      })
    })
  })

  describe('GET /api/v1/links', () => {
    it('should return all of the links', (done) => {
      chai.request(server)
      .get('/api/v1/links')
      .end((err, response) => {
        response.should.have.status(200)
        response.should.be.json
        response.body.should.be.a('array')
        response.body.length.should.equal(5)
        response.body[0].should.have.property('description')
        response.body[0].description.should.equal('Tours')
        response.body[0].should.have.property('origURL')
        response.body[0].origURL.should.equal('http://www.google.com')
        response.body[0].should.have.property('shortURL')
        response.body[0].shortURL.should.equal('a11bd358')
        response.body[0].should.have.property('folder_id')
        response.body[0].folder_id.should.equal(1)
        response.body[0].should.have.property('created_at')
        response.body[0].should.have.property('updated_at')

        response.body[3].should.have.property('description')
        response.body[3].description.should.equal('Food')
        response.body[3].should.have.property('origURL')
        response.body[3].origURL.should.equal('http://www.chewy.com')
        response.body[3].should.have.property('shortURL')
        response.body[3].shortURL.should.equal('a11br432')
        response.body[3].should.have.property('folder_id')
        response.body[3].folder_id.should.equal(2)
        response.body[3].should.have.property('created_at')
        response.body[3].should.have.property('updated_at')

        done()
      })
    })
    it('should return a 404 error if you go to the wrong endpoint', (done) => {
      chai.request(server)
      .get('/api/v1/linx')
      .end((error, response) => {
        response.should.have.status(404)

        done()
      })
    })
  })

  describe('POST /api/v1/folders', () => {
    it('should create a new folder', (done) => {
      chai.request(server)
      .post('/api/v1/folders')
      .send({
        folderName: 'Pictures'
      })
      .end((err, response) => {
        response.should.have.status(201)
        response.body.should.be.a('object')

        chai.request(server)
         .get('/api/v1/folders')
         .end((err, response) => {
          response.should.have.status(200)
          response.should.be.json
          response.body.should.be.a('array')
          response.body.length.should.equal(3)
          response.body[2].should.have.property('folderName')
          response.body[2].folderName.should.equal('Pictures')

          done();
         })
      })
    })
    it('should return a 422 error if required information is missing', (done) => {
      chai.request(server)
      .post('/api/v1/folders')
      .send({
        folderName: ''
      })
      .end((err, response) => {
        response.should.have.status(422)
        response.should.be.json
        response.body.error.should.equal('Missing required parameter folderName')

        done();
      })
    })
    it('should delete a folder that has nothing in it', (done) => {
      chai.request(server)
      .del('/api/v1/folders/3')
      .end((err, response) => {
        response.status.should.equal(200)

        done()
      })
    })
  })

  describe('POST /api/v1/links', () => {
    it('should create a new description and link in specific folder', (done) => {
      chai.request(server)
      .post('/api/v1/links')
      .send({
        description: 'Tacos',
        origURL: 'http://denvertacofestival.com/',
        shortURL: '6297bf86',
        folder_id: 2
      })
      .end((err, response) => {
        response.status.should.equal(201)
        response.should.be.json

        chai.request(server)
        .get('/api/v1/folders/2/links')
        .end((err, response) => {
          response.should.have.status(200)
          response.body.length.should.equal(4)
          response.body[3].should.have.property('description')
          response.body[3].description.should.equal('Tacos')
          response.body[3].should.have.property('origURL')
          response.body[3].origURL.should.equal('http://denvertacofestival.com/')
          response.body[3].should.have.property('shortURL')
          response.body[3].shortURL.should.equal('6297bf86')
          response.body[3].should.have.property('folder_id')
          response.body[3].folder_id.should.equal(2);

          done()
        })
      })
    })
    it('should return an error if required information is missing', (done) => {
      chai.request(server)
      .post('/api/v1/links')
      .send({
        origURL: 'http://denvertacofestival.com/',
        shortURL: '6297bf86',
        folder_id: 2
      })
      .end((err, response) => {
        response.should.have.status(422);
        response.body.error.should.equal(`Missing required parameter description`)

        done()
      })
    })
  })

  describe('redirect', () => {
    it('should redirect to original url', (done) => {
      chai.request(server)
      .get('/api/v1/links/1')
      .end((err, response) => {
        response.should.have.status(200)
        response.redirects[0].should.equal('http://www.google.com/')

        done()
      })
    })
  })
})
