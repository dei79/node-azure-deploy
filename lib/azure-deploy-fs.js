var filewalker  = require('filewalker');
var q           = require('Q');
var rimraf      = require('rimraf');
var path        = require('path');
var ncp         = require('ncp').ncp;

function checkIsFileOrDirectoryExcluded(p, excludes) {
    var bExcluded = false;
    excludes.every(function(exclude) {
        if (p.indexOf(exclude) === 0) {
            bExcluded = true;
            return false;
        } else {
            return true;
        }
    });

    return bExcluded;
}

module.exports.removeDirectoryContent = function(location, excludes) {
    var defer = q.defer();

    // 3. Remove all files
    var directoriesToRemove = [];
    var filesToRemove = [];
    filewalker(location, { recursive: false }).on('dir', function(p) {

        if (checkIsFileOrDirectoryExcluded(p, excludes)) {
            console.log('Ignoring dir: %s', p);
        } else {
            console.log('Directory - Mark for removing: %s', p);
            var dirPath = path.join(location, p);
            directoriesToRemove.push(dirPath);
        }

    }).on('file', function(p, s) {

        if (checkIsFileOrDirectoryExcluded(p, excludes)) {
            console.log('Ignoring file: %s, %d bytes', p, s.size);
        } else {
            console.log('File - Mark for removing: %s, %d bytes', p, s.size);
            var filePath = path.join(location, p);
            filesToRemove.push(filePath);
        }

    }).on('done', function() {

        // remove it
        console.log('Removing directories');
        directoriesToRemove.forEach(function(dirToRemove) {
            rimraf.sync(dirToRemove)
        });

        console.log('Removing files');
        filesToRemove.forEach(function(fileToRemove) {
            rimraf.sync(fileToRemove)
        });

        // ok next step xcopy from source
        defer.resolve();
    }).walk();

    return defer.promise;
}

module.exports.copyDirectoryContentRecursive = function(sourceDir, targetDir) {
    var defer = q.defer();

    ncp.limit = 16;

    ncp(sourceDir, targetDir, function (err) {
        if (err) {
            console.error("Failed to copy files: " + err);
            defer.reject(err);
        } else {
            console.log('Transfered project files into target dir');
            defer.resolve();
        }
    });

    return defer.promise;
};