var Promise = require('promise');
var uuid = require('node-uuid');
var temp = require('temp').track();
var tempMkdir = Promise.denodeify(temp.mkdir);

var azureDeployGit = require('./azure-deploy-git.js');
var azureDeployFs = require('./azure-deploy-fs.js');

module.exports = AzureGitDeploymentManager;

function AzureGitDeploymentManager(azureGitRepository, azureGitUser, azureGitPassword) {
    var self = this;

    self.azureGitRepository = azureGitRepository;
    self.azureUserName = azureGitUser;
    self.azurePassword = azureGitPassword;
}

AzureGitDeploymentManager.prototype.deploy = function (sourceDir) {
    var self = this;

    // https://{{username}}:{{password}}@url
    var repositoryUri = "https://" + self.azureUserName + ":" + self.azurePassword + "@" + self.azureGitRepository.replace('https://', '');

    var currentTempDir;
    var currentGitRepository;

    // 1. Create a temp directory
    return tempMkdir(uuid.v4())

    // 2. Clone the git repository
        .then(function (createdDir) {
            currentTempDir = createdDir;
            console.log('Created temp directory: ' + currentTempDir);
            console.log('Cloning Git Repository into temp directory...');
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
            return azureDeployFs.copyDirectoryContentRecursive(sourceDir, currentTempDir, ['.git']);
        })

        // Commit the changes
        .then(function () {
            console.log('Committing changes...');
            return azureDeployGit.addAndCommit(currentGitRepository, 'Code shipped');
        })

        // Push to the origin
        .then(function () {
            console.log('Pushing to Git Repository...');
            return azureDeployGit.push(currentGitRepository, 'origin');
        })

        .catch(function (error) {
            console.error('Deployment failed:', error);
            return Promise.reject();
        });
};
