/**
 * Query using a Cloudant Query index:
 * https://docs.cloudant.com/cloudant_query.html#finding-documents-using-an-index
 **/

function main(message) {
  var cloudantOrError = getCloudantAccount(message);
  if (typeof cloudantOrError !== 'object') {
    return Promise.reject(cloudantOrError);
  }
  var cloudant = cloudantOrError;
  var dbName = message.dbname;
  var query = message.query;

  if(!dbName) {
    return Promise.reject('dbname is required.');
  }
  if(!query) {
    return Promise.reject('query field is required.');
  }
  var cloudantDb = cloudant.use(dbName);

  if (typeof message.query === 'object') {
    query = message.query;
  } else if (typeof message.query === 'string') {
    try {
      query = JSON.parse(message.query);
    } catch (e) {
      return Promise.reject('query field cannot be parsed. Ensure it is valid JSON.');
    }
  } else {
    return Promise.reject('query field is ' + (typeof query) + ' and should be an object or a JSON string.');
  }

  return queryIndex(cloudantDb, query);

}

function queryIndex(cloudantDb, query) {
  return new Promise(function(resolve, reject) {
    cloudantDb.find(query, function(error, response) {
      if (!error) {
        console.log('success', response);
        resolve(response);
      } else {
        console.log('error', error);
        reject(error);
      }
    });
  });
}

function getCloudantAccount(message) {
  // full cloudant URL - Cloudant NPM package has issues creating valid URLs
  // when the username contains dashes (common in Bluemix scenarios)
  var cloudantUrl;

  if (message.url) {
    // use bluemix binding
    cloudantUrl = message.url;
  } else {
    if (!message.host) {
      return 'cloudant account host is required.';
    }
    if (!message.username) {
      return 'cloudant account username is required.';
    }
    if (!message.password) {
      return 'cloudant account password is required.';
    }

    cloudantUrl = "https://" + message.username + ":" + message.password + "@" + message.host;
  }

  return require('cloudant')({
    url: cloudantUrl
  });
}
