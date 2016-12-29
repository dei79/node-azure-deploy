var Promise = require('promise');
var filewalker = require('filewalker');
var azureDeployFs = require('./azure-deploy-fs.js');
var azureDeployBlob = require('./azure-deploy-blob.js');

module.exports = AzureStorageDeploymentManager;

function AzureStorageDeploymentManager(azureStorageKey, azureStorageSecret, azureStorageContainer) {
    var self = this;

    self.azureStorageKey = azureStorageKey;
    self.azureStorageSecret = azureStorageSecret;
    self.azureStorageContainer = azureStorageContainer;
}

AzureStorageDeploymentManager.prototype.deploy = function (sourceDir, excludes) {
    var self = this;

    // define at least the default excludes
    excludes = excludes|| ['.git', '.idea'];

    // start the fs processing
    return new Promise(function (resolve, reject) {

        var filesToUpload = [];

        console.log('Collecting all files...');
        filewalker(sourceDir, {recursive: true}).on('file', function (p, s) {

            if (azureDeployFs.isExcluded(p, excludes)) {
                console.log(' File - Ignoring: %s, %d bytes', p, s.size);
            } else {
                console.log(' File - Mark for upload: %s, %d bytes', p, s.size);
                filesToUpload.push(p);
            }

        }).on('done', function () {
           azureDeployBlob.upload(self.azureStorageKey, self.azureStorageSecret, self.azureStorageContainer, sourceDir, filesToUpload).then(function() {
               return resolve();
           }).catch(function(error) {
               return reject(error);
           });
        }).walk();
    }).catch(function (error) {
        console.error('Deployment failed:', error);
        return reject(error);
    });
};
