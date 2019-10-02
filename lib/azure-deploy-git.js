var Promise = require('promise');
var git = require('./external/git-exec');

module.exports.clone = function (repositoryUri, targetDirectory, options) {
    return new Promise(function (resolve, reject) {

        // define the clone callback
        function cloneCallback(repo) {
            if (repo === null) {
                reject();
            } else {
                resolve(repo);
            }
        }

        // default options
        options = options || {};

        // use shallow copy except it's prevented
        if (options.noShallowCopy) {
            git.clone(repositoryUri, targetDirectory, cloneCallback);
        } else {
            git.shallowCopyClone(repositoryUri, targetDirectory, cloneCallback);
        }
    });
};

module.exports.addAndCommit = function (gitRepository, commitMessage) {
    var gitRepoExec = Promise.denodeify(gitRepository.exec.bind(gitRepository));

    return gitRepoExec('add', ['-A'])
        .then(function () {
            return gitRepoExec('status',[]).then(function(stdout_status) {
                console.log('Repository Status: ' + stdout_status);
                if (stdout_status && stdout_status.indexOf('Changes to be committed:') === -1) {
                    console.log('No changes in build output, nothing to commit...');
                    return Promise.resolve();
                } else {
                    console.log('Changes detected, committing...');
                    return gitRepoExec('commit', ['-m', '"' + commitMessage + '"']);
                }
            });
        })
        .then(function (stdout) {
            console.log('Commited changes');
            if (stdout) {
                console.log(stdout);
            }
        });
};

module.exports.push = function (gitRepository, remote) {
    var gitRepoExec = Promise.denodeify(gitRepository.exec.bind(gitRepository));

    return gitRepoExec('push', [remote]);
};
