/* eslint-disable import/no-extraneous-dependencies */
const request = require('request');
const fs = require('fs-extra');

const saveAsSvg = (graphStr, format, fullPath) =>
  new Promise((resolve, reject) => {
    request
      .post(
        {
          url: `https://kroki.io/graphviz/${format}`,
          body: graphStr,
        },
        (err) => (err ? reject(err) : resolve()),
      )
      .pipe(fs.createWriteStream(fullPath));
  });

module.exports = saveAsSvg;
