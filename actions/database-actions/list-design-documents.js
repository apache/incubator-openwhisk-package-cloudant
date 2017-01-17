/**
 * List design documents in Cloudant database:
 * https://docs.cloudant.com/design_documents.html
 **/

function main(message) {
  var cloudantOrError = getCloudantAccount(message);
  if (typeof cloudantOrError !== 'object') {
    return Promise.reject(cloudantOrError);
  }
  var cloudant = cloudantOrError;
  var dbName = message.dbname;
  var includeDocs = message.includedocs;
  var params = {};

  if(!dbName) {
    return Promise.reject('dbname is required.');
  }
  var cloudantDb = cloudant.use(dbName);
  //Add start and end key to get _design docs
  params.startkey = '_design'.toString();
  params.endkey = '_design0'.toString();

  //If includeDoc exists and is true, add field to additional params object
  includeDocs = includeDocs.toString().trim().toLowerCase();
  console.log('includeDocs: ' + includeDocs);
  if(includeDocs === 'true') {
    params.include_docs = 'true';
  }

  return listDesignDocuments(cloudantDb, params);
}

/**
 * List design documents.
 **/
function listDesignDocuments(cloudantDb, params) {
  return new Promise(function(resolve, reject) {
    cloudantDb.list(params, function(error, response) {
      if (!error) {
        console.log('success', response);
        resolve(response);
      } else {
        console.error("error", error);
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
