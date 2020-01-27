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
      <div className='slide ${slide.name}' ref='${slide.name}' data-state={slideState}>
        <div className='scale-wrapper'>
        </div>
      </div>
    );
  }
}`;
    fs.writeFileSync(`${path}.js`, JSXTemplate);
  };

  const createBayerSCSS = () => {
    const SCSSTemplate = `.${slide.name}{
}
@media (width: 1024px) {
  .${slide.name} {
    background-size: cover;
    .scale-wrapper{
      position: absolute;
      transform: scale(0.8);
      top: 90px;
    }
  }
}`;
    fs.writeFileSync(`${path}.scss`, SCSSTemplate);
  };
  createBayerJSX();
  createBayerSCSS();
};

module.exports = { createBayerReactSlide };
