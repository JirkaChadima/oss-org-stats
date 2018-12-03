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
