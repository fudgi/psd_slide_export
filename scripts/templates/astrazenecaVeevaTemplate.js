const fs = require("fs");

const createAZVeevaSlide = (path, slide) => {
  const createAZJade = () => {
    const jadeTemplate = `extends ../../blocks/layout/layout
  block content
  .slide_wrapper`;
    fs.writeFileSync(`${path}.jade`, jadeTemplate);
  };

  const createAZCSS = () => {
    const CSSTemplate = `
.slide_${slide.name}{
}`;
    fs.writeFileSync(`${path}.css`, CSSTemplate);
  };

  const createAZJS = () => {
    const JSTemplate = ``;
    fs.writeFileSync(`${path}.js`, JSTemplate);
  };
  createAZJade();
  createAZCSS();
  createAZJS();
};

module.exports = { createAZVeevaSlide };
