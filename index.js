'use strict';

const session = require('express-session');
const Keycloak = require('keycloak-connect');
const express = require('express');
const bodyParser = require('body-parser');
const adminClient = require('keycloak-admin-client');
const getToken = require('keycloak-request-token');
const request = require('request-promise-native');

const app = express();

let memoryStore = new session.MemoryStore();

app.use(session({  
resave: false, 
saveUninitialized: true, 
secret:'thisShouldBeLongAndSecret',                               
store: memoryStore                       
})); 

const settings = {
  baseUrl: 'http://localhost:8080/auth',
  username: 'swarco',
  password: 'ParolaSecreta1234',
  grant_type: 'password',
  client_id: 'admin-cli'  
};

let keycloak = new Keycloak({ store: memoryStore });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use( keycloak.middleware() );

function realmsList() {
  return new Promise((resolve, reject) => {
    adminClient(settings)
      .then((client) => {
        console.log('client', client);
        client.realms.find()
          .then((realms) => {
            console.log('realms', realms);
            resolve(realms);
          });
      })
      .catch((err) => {
        console.log('Error', err);
        reject(err);
      });
  });
}

function usersList(realm) {
  return new Promise((resolve, reject) => {
      adminClient(settings)
        .then((client) => {
          client.users.find(realm)
            .then((users) => {
              resolve(users);
            });
        })
        .catch((err) => {
          reject(err);
        });
  });
}

app.get('/', (req, res) => {
  // console.log(realmsList());
  res.send('This is the node.js backend');	
});

app.get('/realms', (req, res) => {
  realmsList()
    .then(success => res.send(success))
    .catch(error => res.send(error));

});

app.get('/users', (req, res) => {
  console.log(req.query.realm);
  // console.log(res);
  
  const realm = req.query.realm;
  
  usersList(realm)
    .then(success => res.send(success))
    .catch(error => res.send(error));
    
});

let configs = {};
configs.applicationPort = 3000;
configs.dbHost = 'localhost';

app.listen(configs.applicationPort, () => {
  console.log('Example app listening on port '+configs.applicationPort+'!');
});