const fs = require("fs");
const { isIncluded } = require("./helpers");

const addLayerDataToFile = (layer, defaults, slide) => {
  const pathToSave = `${defaults.pathToPutSlides}/${slide.name}/${slide.name}`;

  const addJadeElement = () => {
    const path = `${pathToSave}.jade`;
    if (layer.cuttedName === "bg") return;
    const prevJadeContent = fs.readFileSync(path);
    const startIndex = prevJadeContent.indexOf(".slide_wrapper") + 14;
    const startContent = prevJadeContent.slice(0, startIndex);
    const endContent = prevJadeContent.slice(startIndex);
    newJade = `${startContent}
    .${layer.cuttedName} ${endContent}`;
    fs.writeFileSync(path, newJade);
  };

  const addCSSElement = () => {
    const path = `${pathToSave}.css`;
    const name = layer.cuttedName;
    const prevCSSContent = fs.readFileSync(path);
    let newCSS = ``;
    if (name === "bg") {
      const bgElementTemplate = `background: resolve("bg.jpg") 0 0 / 100% no-repeat;`;
      const firstIndex = prevCSSContent.indexOf("{") + 1;
      const fileStart = prevCSSContent.slice(0, firstIndex);
      const fileEnd = prevCSSContent.slice(firstIndex);
      newCSS = `
    ${fileStart}
    ${bgElementTemplate}${fileEnd}`;
    } else {
      const CSSElementTemplate = `
    .${name}{${
        isIncluded(name, defaults.layerIncludeList)
          ? `\n\t\tdisplay: none;`
          : ``
      }
      position: absolute;
      width: width('${name}.png', ${defaults.scaleRate});
      height: height('${name}.png', ${defaults.scaleRate});
      background: resolve('${name}.png') 0 0 no-repeat;
      background-size: size('${name}.png', ${defaults.scaleRate});
      top: ${(layer.image.get("top") / defaults.scaleRate).toFixed(1)}px;
      left: ${(layer.image.get("left") / defaults.scaleRate).toFixed(1)}px;
    }`;
      const lastIndex = prevCSSContent.lastIndexOf("}");
      const fileEnd = prevCSSContent.slice(0, lastIndex);
      newCSS = `${fileEnd}${CSSElementTemplate}
  }`;
    }
    fs.writeFileSync(path, newCSS);
  };

  const addJSElement = () => {
    const path = `${pathToSave}.js`;
    const prevJSContent = fs.readFileSync(path);
    if (
      isIncluded(layer.cuttedName, defaults.layerIncludeList) &&
      !prevJSContent.includes("Animator")
    )
      return;
    const JSelement = `const slide = document.querySelector(".slide");
  const slideAnimator = new Animator(slide);
  slideAnimator.set(0);
  slide.addEventListener("click", e => {
    const state = e.target.dataset.state;
    state && slideAnimator.set(state);
  });`;
    fs.writeFileSync(path, JSelement);
  };

  const addJSXElement = () => {
    if (layer.cuttedName === "bg") return;
    const path = `${pathToSave}.js`;
    const prevJSContent = fs.readFileSync(path);
    const startIndex = prevJSContent.indexOf("scale-wrapper") + 15;
    const startContent = prevJSContent.slice(0, startIndex);
    const endContent = prevJSContent.slice(startIndex);
    newJSX = `${startContent}
          <div className='${layer.cuttedName}'/> ${endContent}`;
    fs.writeFileSync(path, newJSX);
  };

  const addReactSCSSElement = () => {
    const path = `${pathToSave}.scss`;
    const name = layer.cuttedName;
    const prevCSSContent = fs.readFileSync(path);
    let newCSS = ``;
    if (name === "bg") {
      const bgElementTemplate = `background: url("./img/bg.jpg") 0 0 /contain no-repeat;`;
      const firstIndex = prevCSSContent.indexOf("{") + 1;
      const fileStart = prevCSSContent.slice(0, firstIndex);
      const fileEnd = prevCSSContent.slice(firstIndex);
      newCSS = `
    ${fileStart}
  ${bgElementTemplate}${fileEnd}`;
    } else {
      const CSSElementTemplate = `
  .${name}{${
        isIncluded(name, defaults.layerIncludeList)
          ? `\n\t\tdisplay: none;`
          : ``
      }
    position: absolute;
    width: ${(layer.image.get("width") / defaults.scaleRate).toFixed(1)}px;
    height: ${(layer.image.get("height") / defaults.scaleRate).toFixed(1)}px;
    background: url('./img/${name}.png') 0 0/100% no-repeat;
    top: ${(layer.image.get("top") / defaults.scaleRate).toFixed(1)}px;
    left: ${(layer.image.get("left") / defaults.scaleRate).toFixed(1)}px;
  }`;
      const lastIndex = prevCSSContent.lastIndexOf("}");
      const fileEnd = prevCSSContent.slice(0, lastIndex);
      newCSS = `${fileEnd}${CSSElementTemplate}
}`;
    }
    fs.writeFileSync(path, newCSS);
  };

  const addReactCSSElement = () => {
    const path = `${pathToSave}.css`;
    const name = layer.cuttedName;
    const prevCSSContent = fs.readFileSync(path);
    let newCSS = ``;
    if (name === "bg") {
      const bgElementTemplate = `background: url("./img/bg.jpg") 0 0 /contain no-repeat;`;
      const firstIndex = prevCSSContent.indexOf("{") + 1;
      const fileStart = prevCSSContent.slice(0, firstIndex);
      const fileEnd = prevCSSContent.slice(firstIndex);
      newCSS = `
  ${fileStart}
  ${bgElementTemplate}${fileEnd}`;
    } else {
      const CSSElementTemplate = `
.${slide.name} .${name}{${
        isIncluded(name, defaults.layerIncludeList)
          ? `\n\t\tdisplay: none;`
          : ``
      }
  position: absolute;
  width: ${(layer.image.get("width") / defaults.scaleRate).toFixed(1)}px;
  height: ${(layer.image.get("height") / defaults.scaleRate).toFixed(1)}px;
  background: url('./img/${name}.png') 0 0/100% no-repeat;
  top: ${(layer.image.get("top") / defaults.scaleRate).toFixed(1)}px;
  left: ${(layer.image.get("left") / defaults.scaleRate).toFixed(1)}px;
}`;
      newCSS = `${prevCSSContent}${CSSElementTemplate}
  `;
    }
    fs.writeFileSync(path, newCSS);
  };

  if (defaults.projectType.includes("React")) {
    defaults.projectType.includes("STADA")
      ? addReactSCSSElement()
      : addReactCSSElement();
    addJSXElement();
    return;
  }
  addJadeElement();
  addCSSElement();
  addJSElement();
};

module.exports = addLayerDataToFile;
