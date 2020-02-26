const fs = require("fs");
const { isIncluded } = require("../helpers");

const addMITouchLayer = (layer, defaults, slide) => {
  const pathToSave = `${defaults.pathToPutSlides}/${slide.name}/${slide.name}`;

  const getLayername = layer => {
    const attributes = layer.attributes
      ? layer.attributes.map(attr => "(" + attr + ")")
      : [];
    let classes = [...layer.classes];
    classes[0] = layer.cuttedName;
    return classes.join(".") + attributes.join("");
  };

  const addJadeElement = () => {
    const path = `${pathToSave}.jade`;
    if (layer.cuttedName === "bg") return;
    const prevJadeContent = fs.readFileSync(path);
    const breakWord = "block content";
    const startIndex = prevJadeContent.indexOf(breakWord) + breakWord.length;
    const startContent = prevJadeContent.slice(0, startIndex);
    const endContent = prevJadeContent.slice(startIndex);
    newJade = `${startContent}
  .${getLayername(layer)}${endContent}`;
    fs.writeFileSync(path, newJade);
  };

  const addCSSElement = () => {
    const path = `${pathToSave}.css`;
    const name = layer.cuttedName;
    const prevCSSContent = fs.readFileSync(path);
    let newCSS = ``;
    if (name === "bg") {
      const bgElementTemplate = `background: resolve("bg.jpg") 0 0 / contain no-repeat;`;
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
    ) {
      const JSelement = `const slide = document.querySelector(".slide");
const slideAnimator = new Animator(slide);
slideAnimator.set(0);
slide.addEventListener("click", e => {
  const state = e.target.dataset.state;
  state && slideAnimator.set(state);
});`;
      fs.writeFileSync(path, JSelement);
    }
  };

  addJadeElement();
  addCSSElement();
  addJSElement();
};

module.exports = addMITouchLayer;
