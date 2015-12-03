var Promise = require('promise');
var git = require('git-exec');

module.exports.clone = function (repositoryUri, targetDirectory) {
    return new Promise(function (resolve, reject) {

        git.clone(repositoryUri, targetDirectory, function (repo) {
            if (repo === null) {
                reject();
            } else {
                resolve(repo);
            }
        });

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
