// TODO: resource managment - see https://github.com/petkaantonov/bluebird/blob/master/API.md#resource-management
var helper = require('./helper'),
    Bluebird = require('bluebird'),
    R = require('ramda');

module.exports = {
    syncLocalChangesWithRemote: syncLocalChangesWithRemote,
    getServerDiff: getServerDiff,
    syncFromRemoteDiff: syncFromRemoteDiff,
    sync: sync,
    setConfigAndExecute: function(ftpConfig, fn) {
        helper.setConfigFromFile(ftpConfig);
        console.log(ftpConfig);
        return helper
            .setupFTP()
            .then(fn)
            .finally(helper.closeFTPClient);
    }
};

function sync() {
    return getServerDiff().then(syncFromRemoteDiff);
}

function syncFromRemoteDiff() {
    console.log('syncFromRemoteDiff');
    return Bluebird
        .all([helper.getLocalFiles(), helper.getCache('remote-files.json')])
        .spread(uploadFileDiff)
        // Update remote-files store - remote is now synced with local again
        .then(helper.getLocalFiles)
        .then(R.prop('files'))
        .then(helper.setCache('remote-files.json'))
        .finally(helper.closeFTPClient);
}

function syncLocalChangesWithRemote() {
    console.log('syncLocalChangesWithRemote');
    return Bluebird
        .all([helper.getLocalFiles(), helper.getCache('local-files.json')])
        .spread(uploadFileDiff);
}

function getServerDiff() {
    return Bluebird
        .all([helper.getLocalFiles(), helper.getRemoteFiles()])
        .spread(function(localFiles, remoteFiles) {
            helper.setCache('local-files.json', localFiles);
            helper.setCache('remote-files.json', remoteFiles);
        })
        .finally(helper.closeFTPClient);
}

function uploadFileDiff(filesA, filesB) {
    return Bluebird
        .resolve([filesA, filesB])
        .then(R.pluck('files'))
        .spread(helper.getChangedFiles)
        .tap(helper.setCache('changed-files.json'))
        .then(helper.putFilesOnServer)
        .catch(console.error)
        .then(helper.getLocalFiles)
        // Save changes back
        .then(helper.setCache('local-files.json'))
        .finally(helper.closeFTPClient);
}
