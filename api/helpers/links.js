var url = require('url');

module.exports = { addLinks, getGenericLinks, getRoot, getBaseUrl, getFullUrl , getAuthorizedLinks, getRootLinks };

function addLinks(data, req){
  if( Array.isArray(data)){
    return data.map((item) => {
      return Object.assign(item.toJSON(),{_links: getGenericLinks(req, req.originalUrl, item._id)});
    });
  }else{ // just an object
    let basePath = req.originalUrl;
    let originalUrl = req.originalUrl.split('/');
    let key;
    let id = '';
    if(originalUrl.length <= 3){ // basePath without id
      key = originalUrl[1];
      id = data._id;
     }
     return Object.assign(data.toJSON(), {_links: getAuthorizedLinks(req, basePath, id, key)});
   }
 };

function getRootLinks(data,req){
  let _links = {};
  sublinks['rootLinks'].map((subPath) => {
    _links[subPath.replace('/','_')] = getRoot(req) + subPath;
  });
  return Object.assign(data, {_links: _links});
};

function getGenericLinks(req, basePath, id, key){
  let _links = {};
  let _basePath = basePath;
  _links._root = getRoot(req);
  //_links[basePath.replace('/','_')] = getBaseUrl(req, basePath);
  if(basePath.split('/').length > 3){ // verifies if the basePath already have an id
    _basePath = basePath.slice(0,basePath.lastIndexOf('/'));
  }
  _links._self = getFullUrl(req, _basePath, id);
  return _links;
};

function getAuthorizedLinks(req, basePath, id, key){
  let _links = {};
  let _basePath = '/' + basePath.split('/')[1];
  if(!key || key == 'undefined' || !sublinks[key]){
    return getGenericLinks(req, basePath, id);
  }
  _links._root = getRoot(req);
  _links[_basePath.replace('/','_')] = getBaseUrl(req, _basePath);
  //_links._self = getFullUrl(req,basePath, id);
  sublinks[key].map((subPath) => {
    _links[subPath.replace('/','_')] = getFullUrl(req, _basePath, id) + subPath;
  });
  return _links;
};

function getRoot(req){
  return url.format({
    protocol: req.protocol,
    host: req.get('host')
  });
};

function getBaseUrl(req, basePath){
  return getRoot(req) + basePath;
};

function getFullUrl(req, basePath, id){
  if(!id || id === 'undefined')
    return getBaseUrl(req,basePath);
  return getBaseUrl(req, basePath) + '/' + id;
};

let sublinks = {
  "rootLinks": [
    '/clubs', '/users', '/athletes','/coaches','/managers', '/competitions', '/places', '/products', '/workouts', '/events', '/results'
  ],
  "clubs": [
    "/users", "/athletes", "/coaches", "/managers", "/competitions"
  ],
  "users": [],
  "athletes": [
    "/coaches", "/competitions", "/workouts", "/monthlyFees", "/results"
  ],
  "coaches" : [
    "/competitions", "/workouts", "/athletes"
  ],
  "managers": [],
  "competitions": [
    "/products", "/events", "/athletes", "/coaches", "/results"
  ],
  "products": [],
  "events": [],
  "places": [],
  "results": [],
  "workouts": []
};
