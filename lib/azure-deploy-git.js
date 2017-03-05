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
            return gitRepoExec('commit', ['-m', '"' + commitMessage + '"']);
        })
        .then(function (stdout) {
            console.log('Commited changes');
            console.log(stdout);
        });
};

module.exports.push = function (gitRepository, remote) {
    var gitRepoExec = Promise.denodeify(gitRepository.exec.bind(gitRepository));

    return gitRepoExec('push', [remote]);
};
