var AzureGitDeploymentManager= require('./azure-deploy-git-deployment-manager.js');

module.exports = AzureWebSiteDeploymentManager;

function AzureWebSiteDeploymentManager(azureWebSiteName, azureDeploymentCredentialUserName, azureDeploymnetCredentialPassword, azureDeploymentDomain, azureProjectName) {
    var self = this;

    self.azureWebSiteName = azureWebSiteName;
    self.azureUserName = azureDeploymentCredentialUserName;
    self.azurePassword = azureDeploymnetCredentialPassword;
    self.azureDeploymentDomain = (azureDeploymentDomain) ? azureDeploymentDomain : 'scm.azurewebsites.net';
    self.azureProjectName = (azureProjectName) ? azureProjectName : azureWebSiteName;
}

AzureWebSiteDeploymentManager.prototype.deploy = function (sourceDir, commitMessage) {
    var self = this;

    // https://{{username}}:{{password}}@{{project}}.scm.azurewebsites.net:443/{{project}}.git
    var repositoryUri = "https://" + self.azureWebSiteName + "." + self.azureDeploymentDomain + ":443/" + self.azureProjectName + ".git";

    // use the git deployment Manager
    var gitDeploymentManager = new AzureGitDeploymentManager(repositoryUri, self.azureUserName, self.azurePassword, { gitCloneOptions: { noShallowCopy: true }});

    // start deploymnet
    return gitDeploymentManager.deploy(sourceDir, commitMessage);
};
