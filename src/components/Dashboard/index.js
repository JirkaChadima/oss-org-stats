import React from "react";
import {
  Col,
  Row,
  Card,
  CardDeck,
  CardText,
  CardBody,
  CardTitle,
  Table,
} from 'reactstrap';


const Dashboard = ({ datasource }) => {
    const globalStats = [
      {
        id: "public-members",
        name: () => "Public members",
        metric: (d) => d.members.length,
      },
      {
        id: "public-repos",
        name: () => "Public repositories",
        metric: (d) => d.repositories.length,
      },
      {
        id: "total-subs",
        name: () => "Total subscribers",
        metric: (d) => d.repositories.reduce((acc, r) => acc + (r.subscribers || 0), 0),
      },
      {
        id: "total-stargazers",
        name: () => "Total stargazers",
        metric: (d) => d.repositories.reduce((acc, r) => acc + (r.stargazers || 0), 0),
      },
      {
        id: "total-clones",
        name: () => "Total clones since TODO",
        metric: (d) => d.repositories.reduce((acc, r) => acc + ((r.clones && r.clones.uniques) || 0), 0),
      },
      {
        id: "total-npm",
        name: (d) => `Total NPM downloads since TODO`,
        metric: (d) => d.repositories.reduce((acc, r) => acc + ((r.npm && r.npm.downloads) || 0), 0),
      },
      {
        id: "total-outside-contributors",
        name: (d) => `Total number of outside contributors`,
        metric: (d) => d.repositories
          .reduce((acc, r) => {
            if (r.contributors) {
              return acc.concat(r.contributors
                .filter((c) => {
                  return d.members.find((a) => a.author === c.author) === undefined;
                }).map((r) => r.author)
              );
            }
            return acc;
          }, [])
          .filter((v, i, self) => self.indexOf(v) === i)
          .length,
      },
    ];

    const rankingStats = [
      {
        id: "most-visited-paths",
        name: (d) => `10 Most visited paths since TODO`,
        headers: (d) => (['Path', 'Unique visitors']),
        metric: (d) => d.repositories
          .reduce((acc, r) => {
            if (r.paths) {
              return acc.concat(r.paths);
            }
            return acc;
          }, [])
          .sort((a, b) => a.uniques < b.uniques ? 1 : -1)
          .slice(0, 10)
          .map((a) => ([
            (<a href={`https://github.com/${a.path}`}>{a.path}</a>),
            a.uniques
          ])),
      },
      {
        id: "referrers",
        name: (d) => `10 Biggest referrers since TODO`,
        headers: (d) => (['Referrer', 'Unique visitors']),
        metric: (d) => {
          const set = d.repositories
            .reduce((acc, r) => {
              if (r.referrers) {
                r.referrers.map((x) => {
                  if (acc[x.referrer]) {
                    acc[x.referrer] = Object.assign(acc[x.referrer], {
                      uniques: acc[x.referrer].uniques + x.uniques,
                    })
                  } else {
                    acc[x.referrer] = x;
                  }
                  return acc;
                });
              }
              return acc;
            }, {});
            
          return Object.values(set)
            .sort((a, b) => a.uniques < b.uniques ? 1 : -1)
            .slice(0, 10)
            .map((a) => ([
              a.referrer,
              a.uniques
            ]))
          }
      },
      {
        id: "external-contributors",
        name: (d) => `10 Biggest external contributors since TODO`,
        headers: (d) => (['Contributor', 'Number of commits', 'Additions', 'Deletions']),
        metric: (d) => {
          const set = d.repositories
            .reduce((acc, r) => {
              if (r.contributors) {
                r.contributors.map((x) => {
                  let commits = 0,
                    additions = 0,
                    deletions = 0;
                  if (x.lastTwoWeeks) {
                    x.lastTwoWeeks.map((w) => {
                      commits += w.commits;
                      additions += w.additions;
                      deletions += w.deletions;
                      return true;
                    });
                  }

                  if (acc[x.author]) {
                    acc[x.author] = Object.assign(acc[x.author], {
                      commits: acc[x.author].commits + commits,
                      additions: acc[x.author].additions + additions,
                      deletions: acc[x.author].deletions + deletions,
                    })
                  } else {
                    acc[x.author] = {
                      author: x.author,
                      url: x.url,
                      commits: commits,
                      additions: additions,
                      deletions: deletions,
                    };
                  }
                  return acc;
                });
              }
              return acc;
            }, {});

          return Object.values(set)
            .filter((a) => a.commits > 0)
            .filter((a) => d.members.find((x) => x.author === a.author) === undefined)
            .filter((a) => !(/\[bot\]/).test(a.author))
            .sort((a, b) => a.commits < b.commits ? 1 : -1)
            .slice(0, 10)
            .map((a) => ([
              (<a href={a.url}>{a.author}</a>),
              a.commits,
              a.additions,
              a.deletions
            ]))
          }
      }
    ];
    
    const globals = globalStats.map((n) => {
      return (
        <Col sm="4" key={n.id} className="mb-sm-4">
          <Card>
            <CardBody>
              <CardTitle>{n.metric(datasource)}</CardTitle>
              <CardText>{n.name(datasource)}</CardText>
            </CardBody>
          </Card>
        </Col>
      );
    });

    const rankings = rankingStats.map((n) => {
      const metricList = n.metric(datasource).map((x, i) => {
        const values = x.map((v, j) => (<td key={`val-${i}-${j}`}>{v}</td>))
        return (<tr key={`val-${i}`}>{values}</tr>);
      });
      const headers = n.headers(datasource).map((h) => {
        return (<th key={h}>{h}</th>);
      });
      return (
        <Col key={n.name(datasource)}>
          <h2>{n.name(datasource)}</h2>
          <Table bordered striped responsive hover>
            <thead>
              <tr>{headers}</tr>
            </thead>
            <tbody>
              {metricList}
            </tbody>
          </Table>
        </Col>
      );
    });

    return (
      <React.Fragment>
        <h1>Global numbers</h1>
        <Row>
          <CardDeck>
            {globals}
          </CardDeck>
        </Row>
        <h1>Rankings</h1>
        <Row>
            {rankings}
        </Row>
      </React.Fragment>
    );
}

export default Dashboard;