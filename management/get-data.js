const fetch = require('node-fetch');
const parseLinkHeader = require('parse-link-header');
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
        clones: {
          uniques: s.uniques,
          start: s.clones && s.clones.length && s.clones[0].timestamp,
        }
      };
  });
}

function getViews(repoName) {
  return _genericGetter(repoName, `https://api.github.com/repos/${config.ORGANIZATION}/${repoName}/traffic/views`, (s) => {
    return  {
        views: {
          uniques: s.uniques,
          start: s.views && s.views.length && s.views[0].timestamp,
        }
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
          start: twoWeeksAgo,
          path: x.path,
          uniques: x.uniques,
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
          start: twoWeeksAgo,
          referrer: x.referrer,
          uniques: x.uniques,
        }
      })
    }
  });
}

function getContributors(repoName) {
  return _genericGetter(repoName, `https://api.github.com/repos/${config.ORGANIZATION}/${repoName}/stats/contributors`, (s) => {
    if (!s) {
      return {};
    }
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

function getSubscribers(repoName) {
  return _genericGetter(repoName, `https://api.github.com/repos/${config.ORGANIZATION}/${repoName}/subscribers`, (s) => {
    return {
      subscribers: s.length
    };
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

function getNpmDownloads (repoName, npmRepoSlug, repos) {
  const today = new Date();
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const uri = `https://api.npmjs.org/downloads/point/${twoWeeksAgo.getFullYear()}-${('0' + (twoWeeksAgo.getMonth()+1)).slice(-2) }-${('0' + twoWeeksAgo.getDate()).slice(-2)}:${today.getFullYear()}-${('0' + (today.getMonth()+1)).slice(-2) }-${('0' + today.getDate()).slice(-2)}/${npmRepoSlug}`;
  return fetch(uri).then((r) => r.json())
    .then((s) => {
      return {
        start: new Date(s.start),
        downloads: s.downloads,
      };
    }).catch((e) => {
      console.log(`${repoName}: ${e.message}`);
    });
}

////////////////////////////////
function fetchRepos (url) {
  return fetch(url)
    .then((r) => {
      if (r.headers.get('link')) {
        const links = parseLinkHeader(r.headers.get('link'));
        if (links.next) {
          return fetchRepos(links.next.url)
            .then(async (s) => {
              return s.concat(await r.json());
            });
        }
      }
      return r.json();
    });
}


async function main () {
  let repoList = await fetchRepos(`https://api.github.com/orgs/${config.ORGANIZATION}/repos?type=public`);

  const membersList = await fetch(`https://api.github.com/orgs/${config.ORGANIZATION}/members`, {
    headers: {
      'Authorization': `token ${config.GITHUB_TOKEN}`,
    }
  }).then((r) => r.json());

  const promises = [];
  const repos = {};
  repoList
    .filter((r) => !r.archived)
    .map((r) => {
      repos[r.name] = {
        name: r.name,
        url: r.html_url,
        stargazers: r.stargazers_count,
      }
      promises.push(
        getData(getClones, r.name, repos)
          .then(getData(getContributors, r.name, repos))
          .then(getData(getSubscribers, r.name, repos))
          .then(() => {
            return getData(getViews, r.name, repos)
              .then(getData(getPaths, r.name, repos))
              .then(getData(getReferrers, r.name, repos))
              .then(getData(getReleases, r.name, repos))
          }).catch((e) => {
            console.error(`${r.name}: ${e.message}`);
            console.trace(e);
          })
      );
    });

  Object.keys(config.NPM_MAPPING).map((name) => {
    promises.push(
      getNpmDownloads(name, config.NPM_MAPPING[name], repos)
        .then((r) => {
          repos[name] = Object.assign({}, repos[name], {
            npm: r,
            name: name,
          });
        })
    );
  })

  await Promise.all(promises);

  console.log(JSON.stringify({
    updatedAt: new Date(),
    repositories: Object.values(repos),
    members: membersList.map((u) => {
      return {
        author: u.login,
        url: u.html_url,
      };
    }),
  }));

}

main();
