const fs = require("fs");

const createOCESlide = (path, extension) => {
  const createOCEHTML = () => {
    const HTMLTemplate = `extends ../../blocks/layout/layout
block content`;
    fs.writeFileSync(`${path}.${extension}`, HTMLTemplate);
  };

  const createOCECSS = () => {
    const CSSTemplate = `.slide{
}`;
    fs.writeFileSync(`${path}.css`, CSSTemplate);
  };

  const createOCEJS = () => {
    const JSTemplate = ``;
    fs.writeFileSync(`${path}.js`, JSTemplate);
  };

  createOCEHTML();
  createOCECSS();
  createOCEJS();
};

module.exports = { createOCESlide };
