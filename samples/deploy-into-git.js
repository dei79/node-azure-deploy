var uuid = require('node-uuid');

// Load the credentials (create your own file in the format bellow):
var credentials = require('../.credentials.json')['git01'];

// Get the deployment manager for Azure Blob Storage
var DeploymentManager= require('../lib/azure-deploy.js').AzureGitDeploymentManager;

// start the deployment (we are deploying the while project folder in the storage)
var deploymentManager = new DeploymentManager(credentials.url, credentials.user, credentials.secret);
deploymentManager.deploy('..', ['.git', '.idea', 'node_modules']).then(function() {
    console.log("DONE");
    process.exit(0);
}).catch(function(error) {
    console.log("ERROR: " + error);
    process.exit(1);
});
