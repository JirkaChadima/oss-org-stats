const fs = require('fs'),
  path = require('path');

const dataFolder = path.resolve(__dirname, '../data/'),
  links = [];

const files = fs.readdirSync(dataFolder);
files.forEach(file => {
  if (/\.json$/.test(file)) {
    links.push({
      name: file.replace('.json', ''),
      link: `/data/${file}`
    });
  }
});

console.log(JSON.stringify(links));