const fs = require("fs");

const createAbbottMultipageReactSlide = (path, slide) => {
  const createAbbottMultipageJSX = () => {
    const JSXTemplate = `
import React from 'react'
import ReactDOM from 'react-dom'

import Slide from '../../components/Slide/Slide.js'

export default class ${slide.name[0].toUpperCase() +
      slide.name.slice(1)} extends Slide {
  render() {
    const { slideState } = this.state;
    return (
      <div className='slide ${
        slide.name
      }' onClick={this.slideStateHandle} data-state={slideState}>
      </div>
    );
  }
}

ReactDOM.render(<${slide.name[0].toUpperCase() +
      slide.name.slice(1)} />, document.getElementById('slide_container'))
`;
    fs.writeFileSync(`${path}.js`, JSXTemplate);
  };

  const createAbbottMultipageCSS = () => {
    const CSSTemplate = `
.${slide.name}{
}`;
    fs.writeFileSync(`${path}.css`, CSSTemplate);
  };
  createAbbottMultipageJSX();
  createAbbottMultipageCSS();
};

module.exports = { createAbbottMultipageReactSlide };
