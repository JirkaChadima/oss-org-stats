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

function getData(getter, repoName, repoMap) {
  return getter(repoName)
    .then((s) => {
      repoMap[repoName] = Object.assign(repoMap[repoName], s);
    })
}

function getClones(repoName) {
  return _genericGetter(repoName, `https://api.github.com/repos/${config.ORGANIZATION}/${repoName}/traffic/clones`, (s) => {
    return  {
        clones: s.uniques,
        clonesStart: s.clones && s.clones.length && s.clones[0].timestamp,
        clonesEnd: new Date(),
      };
  });
}

function getViews(repoName) {
  return _genericGetter(repoName, `https://api.github.com/repos/${config.ORGANIZATION}/${repoName}/traffic/views`, (s) => {
    return  {
        views: s.uniques,
        viewsStart: s.views && s.views.length && s.views[0].timestamp,
        viewsEnd: new Date(),
      };
  });
}

function getPaths(repoName) {
  return _genericGetter(repoName, `https://api.github.com/repos/${config.ORGANIZATION}/${repoName}/traffic/popular/paths`, (s) => {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const today = new Date();
    return {
      paths: s.map((x) => {
        return {
          path: x.path,
          uniques: x.uniques,
          pathStart: twoWeeksAgo,
          pathEnd: today,
        }
      })
    }
  });
}

function getReferrers(repoName) {
  return _genericGetter(repoName, `https://api.github.com/repos/${config.ORGANIZATION}/${repoName}/traffic/popular/referrers`, (s) => {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const today = new Date();
    return {
      referrers: s.map((x) => {
        return {
          referrer: x.referrer,
          uniques: x.uniques,
          pathStart: twoWeeksAgo,
          pathEnd: today,
        }
      })
    }
  });
}

function getContributors(repoName) {
  return _genericGetter(repoName, `https://api.github.com/repos/${config.ORGANIZATION}/${repoName}/stats/contributors`, (s) => {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    return {
      contributors: s.map((x) => {
        return {
          author: x.author.login,
          url: x.author.html_url,
          total: x.total,
          lastTwoWeeks: x.weeks
            .filter((w) => {
              const weekStart = new Date(w.w * 1000);
              return weekStart > twoWeeksAgo;
            })
            .map((w) => {
              return {
                start: new Date(w.w * 1000),
                additions: w.a,
                deletions: w.d,
                commits: w.c,
              }
            }),
        }
      })
    }
  });
}

function getReleases(repoName) {
  return _genericGetter(repoName, `https://api.github.com/repos/${config.ORGANIZATION}/${repoName}/releases`, (s) => {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    return {
      releases: s
        .filter((x) => {
          return new Date(x.published_at) > twoWeeksAgo;
        })
        .map((x) => {
          return {
            published: x.published_at,
            name: x.name,
            assets: x.assets.map((a) => {
              return {
                name: a.name,
                downloads: a.download_count,
              }
            }),
          }
        }),
    }
  });
}

////////////////////////////////

async function main () {
  let repoList = await fetch(`https://api.github.com/orgs/${config.ORGANIZATION}/repos`).then((r) => r.json());
  const membersList = await fetch(`https://api.github.com/orgs/${config.ORGANIZATION}/members`).then((r) => r.json());
  repoList = [repoList[4]]; // or 5- wtips
  const promises = [];
  const repos = {};
  repoList
    .filter((r) => !r.archived)
    .map((r) => {
      repos[r.name] = {
        name: r.name,
        url: r.html_url,
        stargazers: r.stargazers_count,
        watchers: r.watchers_count,
      }
      promises.push(getData(getClones, r.name, repos));
      promises.push(getData(getViews, r.name, repos));
      promises.push(getData(getPaths, r.name, repos));
      promises.push(getData(getReferrers, r.name, repos));
      // todo: remove WT members
      // todo: remove bots
      promises.push(getData(getContributors, r.name, repos));
      promises.push(getData(getReleases, r.name, repos));
      // npm downloads
    });

  await Promise.all(promises);

  console.log(JSON.stringify({
    repositories: repos,
    members: membersList.map((u) => {
      return {
        author: u.login,
        url: u.html_url,
      };
    }),
  }));
}

main();
