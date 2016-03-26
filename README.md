# sync-ftp-folder-with-local

Used to sync a local folder with a remote ftp folder.
Caches the remote file data and looks for local diffs. Faster than always going through all files on the FTP (recursively) and getting the timestamp/size of each file every time.
Saves a lot of time when there are a lot of folders/files on the ftp (eg. wordpress).

## Installation and usage

1. `npm install https://github.com/davidgengenbach/sync-ftp-folder-with-local --save`
1. Create a `ftp-config.json` (without the comments, because ... json):
```javascript
{
    // local folder
    "local": "LOCAL",
    // absolute path on the ftp server
    "remote": "REMOTE",
    "host": "host.de",
    "port": 21,
    "user": "USER",
    "password": "FTP_PASSWORD",
    "connections": "1",
    // files to ignore
    "ignore": [".git", "tmp/*", ".DS_Store", "*.less.cache", "__MACOSX"],
    // local path to the place where the server file cache (timestamp/sizes of the remote files) will be placed and read
    "localCache": "ftp-cache"
}
```
1. (These options will be passed to [node-ftp](https://github.com/mscdex/node-ftp) and [syncftp](https://github.com/evanplaice/node-ftpsync))
1. Create the `ftp-cache` folder from this newly created `ftp-config.json`.
1. Run `$(npm bin)/ftp-upload sync-remote ftp-config.json` to start getting the remote information from the server - this has to be done once and when there are changes on the server that are not done by this script! (= the cached remote information is not valid anymore)
1. Run `$(npm bin)/ftp-upload sync-remote-from-local ftp-config.json` every time you want to sync the remote ftp with the local changes.

### Usage at your own risk :stuck_out_tongue:
It's untested and right now only serves my own needs. Pull requests etc. welcome
