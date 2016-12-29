var Promise = require('promise');
var azure = require('azure-storage');
var path = require('path');


function uploadSequential(srcDirectory, srcFilesWorkingCopy, blobService, storageContainer, resolve, reject) {

    // check if we are done
    if (srcFilesWorkingCopy.length === 0) {
        return resolve();
    }

    // upload the first file
    console.log("Uploading " + srcFilesWorkingCopy[0]);
    blobService.createBlockBlobFromLocalFile(storageContainer, srcFilesWorkingCopy[0], path.join(srcDirectory, srcFilesWorkingCopy[0]), function (error) {
        if (error) {
            reject(error);
        } else {
            srcFilesWorkingCopy.splice(0,1);
            return uploadSequential(srcDirectory, srcFilesWorkingCopy, blobService, storageContainer, resolve, reject)
        }
    });
}

module.exports.upload = function (storageKey, storageSecret, storageContainer, srcDirectory, srcFiles) {

    return new Promise(function (resolve, reject) {
        // generate a working copy of the srcFiles-Array
        var workingCopyFiles = [];
        workingCopyFiles.push.apply(srcFiles);

        // create the blob service
        console.log("Preparing storage " + storageKey + " and container " + storageContainer);
        var blobService = azure.createBlobService(storageKey, storageSecret);

        // create the target container if not exists
        blobService.createContainerIfNotExists(storageContainer, {publicAccessLevel: 'blob'}, function (error, result, response) {
            if (error) {
                console.log("Error: failed to create the container");
                return reject(error);
            }

            // upload the files
            console.log('Uploading marked files...');
            return uploadSequential(srcDirectory, srcFiles, blobService, storageContainer, resolve, reject);
        });
    });
};

