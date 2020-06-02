const fs = require("fs");

const createPetrovaxReactSlide = (path, slide) => {
  const createPetrovaxJSX = () => {
    const JSXTemplate = `
import React from 'react';
import Slide from '../../components/slide/slide.js';
import './${slide.name}.scss';

export default class ${slide.name} extends Slide {
  constructor(props) {
    super({ ...props });
  }
  render() {
    const { slideState } = this.state;
    return (
      <div 
        className={'slide ${slide.name} ${slide.name}_' + slideState} 
        data-state={slideState} 
        onClick={this.slideClickHandler} 
        onChange={this.slideChangeHandler}
      >
        <div className='scale-wrapper'>
        </div>
      </div>
    );
  }
}`;
    fs.writeFileSync(`${path}.js`, JSXTemplate);
  };

  const createPetrovaxSCSS = () => {
    const SCSSTemplate = `.${slide.name}{
}`;
    fs.writeFileSync(`${path}.scss`, SCSSTemplate);
  };

  createPetrovaxJSX();
  createPetrovaxSCSS();
};

module.exports = { createPetrovaxReactSlide };
