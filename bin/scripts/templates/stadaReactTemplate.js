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
     
      <div className={'slide ${slide.name} ${slide.name}_' + slideState} ref='${slide.name}' data-state={slideState} onClick={this.slideClickHandler}>
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
}
@media (width: 1024px) {
  .${slide.name} {
    background-size: cover;
    .scale-wrapper{
      position: absolute;
      transform: scale(0.8);
      top: 130px;
    }
  }
}`;
    fs.writeFileSync(`${path}.scss`, SCSSTemplate);
  };

  createStadaJSX();
  createStadaSCSS();
};

module.exports = { createStadaReactSlide };
