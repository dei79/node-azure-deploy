var Promise = require('promise');
var uuid = require('node-uuid');
var temp = require('temp').track();
var tempMkdir = Promise.denodeify(temp.mkdir);

var azureDeployGit = require('./azure-deploy-git.js');
var azureDeployFs = require('./azure-deploy-fs.js');

module.exports = AzureWebSiteDeploymentManager;

function AzureWebSiteDeploymentManager(azureWebSiteName, azureDeploymentCredentialUserName, azureDeploymnetCredentialPassword, azureDeploymentDomain) {
    var self = this;

    self.azureWebSiteName = azureWebSiteName;
    self.azureUserName = azureDeploymentCredentialUserName;
    self.azurePassword = azureDeploymnetCredentialPassword;
    self.azureDeploymentDomain = (typeof azureDeploymentDomain === 'undefined') ? 'scm.azurewebsites.net' : azureDeploymentDomain;
}

AzureWebSiteDeploymentManager.prototype.deploy = function (sourceDir) {
    var self = this;

    // https://{{username}}:{{password}}@{{project}}.scm.azurewebsites.net:443/{{project}}.git
    var repositoryUri = "https://" + self.azureUserName + ":" + self.azurePassword + "@" + self.azureWebSiteName + "." + self.azureDeploymentDomain + ":443/" + self.azureWebSiteName + ".git";

    var currentTempDir;
    var currentGitRepository;

    // 1. Create a temp directory
    return tempMkdir(uuid.v4())

    // 2. Clone the git repository
        .then(function (createdDir) {
            currentTempDir = createdDir;
            console.log('Created temp directory: ' + currentTempDir);
            console.log('Cloning azure website repository into temp directory...');
            return azureDeployGit.clone(repositoryUri, currentTempDir);
        })

        // Remove the content of the directory
        .then(function (gitRepo) {
            currentGitRepository = gitRepo;
            console.log('Removing files from cloned repository...');
            return azureDeployFs.removeDirectoryContent(currentTempDir, ['.git'])
        })

        // Copy the new content from source to the repository
        .then(function () {
            console.log('Copying new files to cloned repository...');
            return azureDeployFs.copyDirectoryContentRecursive(sourceDir, currentTempDir);
        })

        // Commit the changes
        .then(function () {
            console.log('Commiting changes...');
            return azureDeployGit.addAndCommit(currentGitRepository, 'Code shipped');
        })

        // Push to the origin
        .then(function () {
            console.log('Pushing to azure website...');
            return azureDeployGit.push(currentGitRepository, 'origin');
        })

        .catch(function (error) {
            console.error('Deplyment failed:', error);
            return Promise.reject();
        });
};
