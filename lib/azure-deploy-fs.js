var Promise = require('promise');
var filewalker = require('filewalker');
var path = require('path');
var rimraf = Promise.denodeify(require('rimraf'));
var ncp = Promise.denodeify(require('ncp').ncp);

function checkIsFileOrDirectoryExcluded(p, excludes) {
    var bExcluded = false;
    excludes.every(function (exclude) {
        if (p.indexOf(exclude) === 0) {
            bExcluded = true;
            return false;
        } else {
            return true;
        }
    });

    return bExcluded;
}

module.exports.removeDirectoryContent = function (location, excludes) {
    return new Promise(function (resolve, reject) {

        console.log('Collecting directories and files to remove');

        var directoriesToRemove = [];
        var filesToRemove = [];
        filewalker(location, {recursive: false}).on('dir', function (p) {

            if (checkIsFileOrDirectoryExcluded(p, excludes)) {
                console.log(' Directory - Ignoring: %s', p);
            } else {
                console.log(' Directory - Mark for removing: %s', p);
                var dirPath = path.join(location, p);
                directoriesToRemove.push(dirPath);
            }

        }).on('file', function (p, s) {

            if (checkIsFileOrDirectoryExcluded(p, excludes)) {
                console.log(' File - Ignoring: %s, %d bytes', p, s.size);
            } else {
                console.log(' File - Mark for removing: %s, %d bytes', p, s.size);
                var filePath = path.join(location, p);
                filesToRemove.push(filePath);
            }

        }).on('done', function () {

            console.log('Removing collected directories and files');
            var allDirsAndFiles = directoriesToRemove.concat(filesToRemove);
            Promise.all(allDirsAndFiles.map(function (dir) {
                return rimraf(dir);
            })).then(resolve, reject);

        }).walk();

    });
};

module.exports.copyDirectoryContentRecursive = function (sourceDir, targetDir, excludes) {

    // expand the source Dir
    var expandedSourceDir = path.resolve(sourceDir);

    // define the copy filter
    function copyFilter(file) {

        // remove the absolute path prefix
        var relativeFile = file.replace(expandedSourceDir, '');
        if (relativeFile[0] == '/') {
            relativeFile = relativeFile.substring(1);
        }

        var excluded = checkIsFileOrDirectoryExcluded(relativeFile, excludes);
        if (excluded) { console.log('Ignoring: %s', file);}
        return !excluded;
    }

    return ncp(sourceDir, targetDir, {filter: copyFilter})
        .then(function () {
            console.log('Transfered project files into target dir');
        }, function (err) {
            console.error('Failed to copy files: ' + err);
        });
};

module.exports.isExcluded = function(location, excludes) {
    return checkIsFileOrDirectoryExcluded(location, excludes);
};