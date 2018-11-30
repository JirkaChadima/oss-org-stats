import React from "react";

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

    const rankings = [
      // most visited paths
      // most incoming traffic from
    ];
    
    const globals = globalStats.map((n) => {
      return (<p key={n.id}>{n.name(datasource)} {n.metric(datasource)}</p>);
    })

    return (
      <div>
        {globals}
      </div>
    );
}

export default Dashboard;