# OSS Org stats

If you are a GitHub driven organization and publish your packages on NPM, this 
might work for you.

## Requirements

- Node 10

## How to make this work

Setup config.js:

```js
module.exports = {
  "ORGANIZATION": "org name",
  "GITHUB_TOKEN": "github token that can has push access to your repositories",
  "NPM_MAPPING": {
    // repo: npmhandle
  }
}
```

## A possible production setup
Running a cronjob daily that does:

```sh
#!/bin/bash
cd /home/me/oss-org-stats
nvm use
npm run import-data
npm run deploy
```

This will download github and NPM data and deploy this package to github pages.

Or run this as a Dockerized task form your own repository fork:

```sh
$ docker build -t oss-org-stats .
$ docker run \
  -e REPO_HTTPS_ADDRESS=https://12345-github-token@github.com/organization/oss-org-stats.git \
  -e PUBLISHER_EMAIL= chadima.jiri@gmail.com \
  -e PUBLISHER_NAME= jirkachadima \
  oss-org-stats
```