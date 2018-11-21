const fetch = require('node-fetch');
const config = require('../config');

function _genericGetter(repoName, uri, process) {
  return fetch(uri, {
    headers: {
      'Authorization': `token ${config.GITHUB_TOKEN}`,
    }
  }).then((r) => r.json())
    .then((s) => {
      if (s.message) {
        throw new Error(s.message);
      }
      return process(s);
    }).catch((e) => {
      console.log(`${repoName}: ${e.message}`);
    });
}

function getClones(repoName) {
  return _genericGetter(repoName, `https://api.github.com/repos/windingtree/${repoName}/traffic/clones`, (s) => {
    return  {
        clones: s.uniques,
        clonesStart: s.clones && s.clones.length && s.clones[0].timestamp,
        clonesEnd: new Date(),
      };
  });
}

function getViews(repoName) {
  return _genericGetter(repoName, `https://api.github.com/repos/windingtree/${repoName}/traffic/views`, (s) => {
    return  {
        views: s.uniques,
        viewsStart: s.views && s.views.length && s.views[0].timestamp,
        viewsEnd: new Date(),
      };
  });
}

function getData(getter, repoName, repoMap) {
  return getter(repoName)
    .then((s) => {
      repoMap[repoName] = Object.assign(repoMap[repoName], s);
    })
}


////////////////////////////////

async function main () {
  const repoList = await fetch(`https://api.github.com/orgs/${config.ORGANIZATION}/repos`).then((r) => r.json());
  const promises = [];
  const repos = {};
  repoList.map((r) => {
    repos[r.name] = {
      name: r.name,
      url: r.html_url,
      stargazers: r.stargazers_count,
      watchers: r.watchers_count,
    }
    promises.push(getData(getClones, r.name, repos));
    promises.push(getData(getViews, r.name, repos));
  });

  await Promise.all(promises);
  console.log(repos);
}

main();
