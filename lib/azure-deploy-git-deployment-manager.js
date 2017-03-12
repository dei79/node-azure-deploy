var Promise = require('promise');
var uuid = require('node-uuid');
var temp = require('temp').track();
var tempMkdir = Promise.denodeify(temp.mkdir);

var azureDeployGit = require('./azure-deploy-git.js');
var azureDeployFs = require('./azure-deploy-fs.js');

module.exports = AzureGitDeploymentManager;

function AzureGitDeploymentManager(azureGitRepository, azureGitUser, azureGitPassword, options) {
    var self = this;

    self.azureGitRepository = azureGitRepository;
    self.azureUserName = azureGitUser;
    self.azurePassword = azureGitPassword;
    self.options = options || {};
}

AzureGitDeploymentManager.prototype.deploy = function (sourceDir, excludes, commitMessage) {
    var self = this;

    // https://{{username}}:{{password}}@url
    var repositoryUri = "https://" + self.azureUserName + ":" + self.azurePassword + "@" + self.azureGitRepository.replace('https://', '');

    var currentTempDir;
    var currentGitRepository;

    // define at least the default excludes
    excludes = excludes || ['.git', '.idea'];

    // ensure we exclude the local .git
    if (excludes.indexOf('.git') === -1) { excludes.push('.git'); }

    // 1. Create a temp directory
    return tempMkdir(uuid.v4())

    // 2. Clone the git repository
        .then(function (createdDir) {
            currentTempDir = createdDir;
            console.log('Created temp directory: ' + currentTempDir);
            console.log('Cloning Git Repository into temp directory...');
            return azureDeployGit.clone(repositoryUri, currentTempDir, self.options.gitCloneOptions);
        })

        // Remove the content of the directory
        .then(function (gitRepo) {
            currentGitRepository = gitRepo;
            console.log('Removing files from cloned repository...');
            return azureDeployFs.removeDirectoryContent(currentTempDir, excludes)
        })

        // Copy the new content from source to the repository
        .then(function () {
            console.log('Copying new files to cloned repository...');
            return azureDeployFs.copyDirectoryContentRecursive(sourceDir, currentTempDir, excludes);
        })

        // Commit the changes
        .then(function () {
            console.log('Committing changes...');

            if (!commitMessage) { commitMessage = 'Code shipped'; }
            console.log('Message: ' + commitMessage);

            return azureDeployGit.addAndCommit(currentGitRepository, commitMessage);
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
