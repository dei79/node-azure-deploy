var uuid = require('node-uuid');

// Load the credentials (create your own file in the format bellow):
//
//  {
//      "storage01" : {
//          "key": "<<StorageAccountName>>",
//          "secret": "<<StorageAccountSecret>>"
//      }
//  }
var credentials = require('../.credentials.json')['storage01'];

// Get the deployment manager for Azure Blob Storage
var AzureStorageDeploymentManager = require('../lib/azure-deploy.js').AzureStorageDeploymentManager;

// start the deployment (we are deploying the while project folder in the storage)
var deploymentManager = new AzureStorageDeploymentManager(credentials.key, credentials.secret, 'deploy' + uuid.v4());
deploymentManager.deploy('..', ['.git', '.idea', 'node_modules']).then(function() {
    console.log("DONE");
    process.exit(0);
}).catch(function(error) {
    console.log("ERROR: " + error);
    process.exit(1);
});
