var q   = require('q');
var git = require('git-exec');

module.exports.clone = function(repositoryUri, targetDirectory) {
    var defered = q.defer();

    git.clone(repositoryUri, targetDirectory, function(repo) {

        if (repo === null) {
            defered.reject();
        } else {
            defered.resolve(repo);
        }
    });

    return defered.promise;
};

module.exports.addAndCommit = function(gitRepository, commitMessage) {
    var defered = q.defer();

    // call git add -A
    gitRepository.exec("add", ['-A'], function(errGitAdd, stdout) {

        if (errGitAdd) {
            defered.reject(errGitAdd);
        } else {
            gitRepository.exec("commit", ['-m', '"' + commitMessage + '"'], function (errCommit, stdout) {

                if (errCommit) {
                    defered.reject(errCommit);
                } else {
                    console.log("Commited changes");
                    console.log(stdout);

                    defered.resolve();
                }
            })
        };
    });

    return defered.promise;
};

module.exports.push = function(gitRepository, remote) {
    var defered = q.defer();

    gitRepository.exec("push", [remote], function(errGitPush, stdout) {
        if (errGitPush) {
            defered.reject(errGitPush);
        } else {
            defered.resolve();
        }
    });

    return defered.promise;
}