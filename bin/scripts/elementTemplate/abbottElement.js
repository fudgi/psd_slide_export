const fs = require("fs");
const { isIncluded } = require("../helpers");

const addAbbottLayer = (layer, defaults, slide) => {
  const pathToSave = `${defaults.pathToPutSlides}/${slide.name}/${slide.name}`;

  const getClasses = layer => {
    let classes = [...layer.classes];
    classes[0] = layer.cuttedName;
    return classes.join(" ");
  };
  const getAttributes = layer => {
    return layer.attributes ? layer.attributes.join("") : "";
  };
  const addJSXAbbottElement = () => {
    if (layer.cuttedName === "bg") return;
    const path = `${pathToSave}.js`;
    const prevJSContent = fs.readFileSync(path);
    const startIndex = prevJSContent.indexOf("data-state={slideState}") + 24;
    const startContent = prevJSContent.slice(0, startIndex);
    const endContent = prevJSContent.slice(startIndex);
    newJSX = `${startContent}
          <div className='${getClasses(layer)}' ${getAttributes(
      layer
    )}/>${endContent}`;
    fs.writeFileSync(path, newJSX);
  };

  const addReactCSSAbbottElement = () => {
    const path = `${pathToSave}.css`;
    const name = layer.cuttedName;
    const prevCSSContent = fs.readFileSync(path);
    let newCSS = ``;
    if (name === "bg") {
      const bgElementTemplate = `background: url("./img/bg.jpg") 0 0 /contain no-repeat;`;
      const firstIndex = prevCSSContent.indexOf("{") + 1;
      const fileStart = prevCSSContent.slice(0, firstIndex);
      const fileEnd = prevCSSContent.slice(firstIndex);
      newCSS = `${fileStart}
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
    background: url('./img/${name}.png') 0 0/contain no-repeat;
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

  addReactCSSAbbottElement();
  addJSXAbbottElement();
};

module.exports = addAbbottLayer;
