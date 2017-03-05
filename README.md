# Azure Deploy f. Node

This module allows to deploy an application, e.g. a node application or a single page application written in
Angular.js into an Azure WebSite. The module relies on the Git based deployment of Azure WebSite and can easily
used also for other services with a git backend.

In addition this module supports deployment of files into an Azure Storage account which is often used as backend 
for static web sites. 

## Installation

The module will be integrated in the project structure via node package manager. The following command installs and
save it as development dependency:

```
npm install azure-deploy --saveDev
```

## Usage WebSite Deployment

The module offers a couple simple to use classes which can be used as follows:

Include the module in a specific application:

```
var azureDeploy = require('azure-deploy');
```

Define the source folder which needs to be deployed to the Azure WebSite:

```
var sourceFolder = 'YOUR SOURCE FOLDER';
```

Instantiate the Deployment-Manager which orchestrates everything:

```
var deploymentManager = new azureDeploy.AzureWebSiteDeploymentManager(
            'Azure WebSite Name', 'Azure Deployment UserName', 'Azure Deployment Password');
```

The deployment manager can be used to perform a deployment from a specific source directory. The deploy method returns
a promise which will be resolved as soon the deployment is finished:

```
deploymentManager.deploy(sourceFolder).then(function() {
    // DONE
}).catch(function(error) {
    // ERROR
});
```

## Usage Azure Storage Deployment

The module offers a couple simple to use classes which can be used as follows:

Include the module in a specific application:

```
var azureDeploy = require('azure-deploy');
```

Define the source folder which needs to be deployed to the Azure WebSite:

```
var sourceFolder = 'YOUR SOURCE FOLDER';
```

Instantiate the Deployment-Manager which orchestrates everything:

```
var deploymentManager = new azureDeploy.AzureStorageDeploymentManager(
            'AzureStorageKey', 'AzureStorageSecret', 'AzureStorageContainer');
```

The deployment manager can be used to perform a deployment from a specific source directory. The deploy method returns
a promise which will be resolved as soon the deployment is finished:

```
deploymentManager.deploy(sourceFolder).then(function() {
    // DONE
}).catch(function(error) {
    // ERROR
});
```

## Usage Git Deployment

The module offers a couple simple to use classes which can be used as follows:

Include the module in a specific application:

```
var azureDeploy = require('azure-deploy');
```

Define the source folder which needs to be deployed to the Azure WebSite:

```
var sourceFolder = 'YOUR SOURCE FOLDER';
```

Instantiate the Deployment-Manager which orchestrates everything:

```
var deploymentManager = new azureDeploy.AzureGitDeploymentManager(
            'URL to GitRepo', 'Git Repo UserName', 'Git Repo Password');
```

The deployment manager can be used to perform a deployment from a specific source directory. The deploy method returns
a promise which will be resolved as soon the deployment is finished:

```
deploymentManager.deploy(sourceFolder).then(function() {
    // DONE
}).catch(function(error) {
    // ERROR
});
```

The Git Deployment Manager is using a shallow copy of the target Git-Repository. To Prevent this 
initialize it as follows:

```
var deploymentManager = new azureDeploy.AzureGitDeploymentManager(
            'URL to GitRepo', 'Git Repo UserName', 'Git Repo Password', { gitCloneOptions: { noShallowCopy: true }});
```

## Grunt Integration
The node module can be integrated in an existing Gruntfile very easily. The following code fragment demonstrates an
integration approach:

```
grunt.registerMultiTask('azureDeploy', 'Deploys the current build to an Azure Website.', function() {
        var sourceFolder = appConfig.dist;
        var deploymentManager = new azureDeploy.AzureWebSiteDeploymentManager(
            this.data.azureWebSiteName,
            this.data.azureDeploymentCredentialUserName,
            this.data.azureDeploymentCredentialPassword
        );

        grunt.log.writeln('Starting deployment...');

        var done = this.async();

        deploymentManager.deploy(sourceFolder)
        .then(function() {
            grunt.log.writeln('Deployment to Azure Website finished successfully.');
            done();
        })
        .catch(function() {
            grunt.log.writeln('Deployment to azure website finished with errors.');
            done(false);
        })
}
```

