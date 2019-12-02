const fs = require("fs");
const { createFolder } = require("./helpers");

const createSlideStructure = (defaults, slide) => {
  const pathToSave = `${defaults.pathToPutSlides}/${slide.name}`;
  const path = `${pathToSave}/${slide.name}`;

  const createJade = () => {
    const jadeTemplate = `extends ../../blocks/layout/layout
block content
  .slide_wrapper`;
    fs.writeFileSync(`${path}.jade`, jadeTemplate);
  };

  const createCSS = () => {
    const CSSTemplate = `
  .slide_${slide.name}{
  }`;
    fs.writeFileSync(`${path}.css`, CSSTemplate);
  };

  const createJS = () => {
    const JSTemplate = ``;
    fs.writeFileSync(`${path}.js`, JSTemplate);
  };

  const createJSX = cssFormat => {
    const JSXTemplate = `
import React from 'react';
${
  cssFormat === "scss"
    ? `import Slide from '../../components/slide/slide.js';`
    : `import Slide from '../../Slide/Slide.js'`
}
import './${slide.name}.${cssFormat}';

export default class ${slide.name} extends Slide {
  render() {
    const { slideState } = this.state;
    return (
      <div className='slide ${slide.name}' ref='${
      slide.name
    }' data-state={slideState}>
        <div className='scale-wrapper'>
        </div>
      </div>
    );
  }
}`;
    fs.writeFileSync(`${path}.js`, JSXTemplate);
  };

  const createSCSS = cssFormat => {
    const SCSSTemplate = `
.${slide.name}{
}`;
    fs.writeFileSync(`${path}.${cssFormat}`, SCSSTemplate);
  };

  createFolder(pathToSave);
  createFolder(`${pathToSave}/img`);
  if (defaults.projectType.includes("React")) {
    const cssFormat = defaults.projectType.includes("STADA") ? "scss" : "css";
    createJSX(cssFormat);
    createSCSS(cssFormat);
    return;
  }
  createJade();
  createCSS();
  createJS();
};

module.exports = createSlideStructure;
