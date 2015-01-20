var q = require('Q');
var Guid = require('guid');
var temp = require("temp").track();

var git = require('./azure-deploy-git.js');
var azureDeployFsUtils = require('./azure-deploy-fs.js');

module.exports = AzureWebSiteDeploymentManager;

function AzureWebSiteDeploymentManager(azureWebSiteName, azureDeploymentCredentialUserName, azureDeploymnetCredentialPassword, gitUserAccount, gitUserAddress) {
    var self = this;

    self.azureWebSiteName   = azureWebSiteName;
    self.azureUserName      = azureDeploymentCredentialUserName;
    self.azurePassword      = azureDeploymnetCredentialPassword;
    self.gitUserAccount     = gitUserAccount;
    self.gitUserAddress     = gitUserAddress;
}

AzureWebSiteDeploymentManager.prototype.deploy = function(sourceDir, message) {
    var self = this;

    var defer = q.defer();

    // 1. Create a temp directory
    temp.mkdir(Guid.raw(), function(err, currentTempDir) {

        console.log("Temp: " + currentTempDir);

        // 2. Clone the git repository
        // https://{{username}}:{{password}}@{{project}}.scm.azurewebsites.net:443/{{project}}.git
        var repositoryUri = "https://" + self.azureUserName + ":" + self.azurePassword + "@" + self.azureWebSiteName + ".scm.azurewebsites.net:443/" + self.azureWebSiteName + ".git";
        var currentGitRepository = null;

        // Clone the files from remote
        git.clone(repositoryUri, currentTempDir)

            // Remove the content of the directory
            .then(function(gitRepo) {
                currentGitRepository = gitRepo;
                return azureDeployFsUtils.removeDirectoryContent(currentTempDir, ['.git'])
            })

            // Copy the new content from source to the repository
            .then(function() {
                return azureDeployFsUtils.copyDirectoryContentRecursive(sourceDir, currentTempDir);
            })

            // Commit the changes
            .then(function() {
                return git.addAndCommit(currentGitRepository, "Code shipped");
            })

            // Push to the origin
            .then(function() {
                return git.push(currentGitRepository, "origin");
            })

            // All done
            .then(function() {
                // console.log("all good");
                defer.resolve();
            })

            // Error
            .catch(function(error) {
                // console.log("Something went wrong: " + error);
                defer.resolve(error);
            });
        });

    // done
    return defer.promise;
};