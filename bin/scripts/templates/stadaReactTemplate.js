const fs = require("fs");

const createStadaReactSlide = (path, slide) => {
  const createStadaJSX = () => {
    const JSXTemplate = `
import React from 'react';
import Slide from '../../components/slide/slide.js';
import './${slide.name}.scss';

export default class ${slide.name} extends Slide {
  constructor(props) {
    super({ header, ...props });
  }
  render() {
    const { slideState } = this.state;
    return (
      <div className='slide ${slide.name}' ref='${slide.name}' data-state={slideState}>
        <div className='scale-wrapper'>
        </div>
      </div>
    );
  }
}

const header = {
  transparentHeader: true,
};`;
    fs.writeFileSync(`${path}.js`, JSXTemplate);
  };

  const createStadaSCSS = () => {
    const SCSSTemplate = `.${slide.name}{
}`;
    fs.writeFileSync(`${path}.scss`, SCSSTemplate);
  };

  createStadaJSX();
  createStadaSCSS();
};

module.exports = { createStadaReactSlide };
