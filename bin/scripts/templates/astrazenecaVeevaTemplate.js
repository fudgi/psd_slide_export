const fs = require("fs");

const createAZVeevaSlide = (path, slide, extension) => {
  const createAZHTML = () => {
    const HTMLTemplate = `extends ../../blocks/layout/layout
block content
  .slide_wrapper`;
    fs.writeFileSync(`${path}.${extension}`, HTMLTemplate);
  };

  const createAZCSS = () => {
    const CSSTemplate = `.slide_${slide.name}{
}`;
    fs.writeFileSync(`${path}.css`, CSSTemplate);
  };

  const createAZJS = () => {
    const JSTemplate = ``;
    fs.writeFileSync(`${path}.js`, JSTemplate);
  };
  createAZHTML();
  createAZCSS();
  createAZJS();
};

module.exports = { createAZVeevaSlide };
