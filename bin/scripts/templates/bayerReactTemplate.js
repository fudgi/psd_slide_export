const fs = require("fs");

const createBayerReactSlide = (path, slide) => {
  const createBayerJSX = () => {
    const JSXTemplate = `
import React from 'react';
import Slide from '../../Slide/Slide.js';
import './${slide.name}.scss';

export default class ${slide.name} extends Slide {
  render() {
    const { slideState } = this.state;
    return (
      <div className='slide ${slide.name}'  data-state={slideState} onClick={this.slideClickHandler}>
      </div>
    );
  }
}`;
    fs.writeFileSync(`${path}.js`, JSXTemplate);
  };

  const createBayerSCSS = () => {
    const SCSSTemplate = `.${slide.name}{
}`;
    fs.writeFileSync(`${path}.scss`, SCSSTemplate);
  };
  createBayerJSX();
  createBayerSCSS();
};

module.exports = { createBayerReactSlide };
