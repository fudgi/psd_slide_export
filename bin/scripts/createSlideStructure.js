const { createFolder } = require("./helpers");
const { createAZVeevaSlide } = require("./templates/astrazenecaVeevaTemplate");
const { createStadaReactSlide } = require("./templates/stadaReactTemplate");
const { createBayerReactSlide } = require("./templates/bayerReactTemplate");
const {
  createPetrovaxReactSlide,
} = require("./templates/petrovaxReactTemplate");
const {
  createAbbottMultipageReactSlide,
} = require("./templates/abbottMultipageTemplate");
const { createMITouchVeevaSlide } = require("./templates/miTouchTemplate.js");
const { createOCESlide } = require("./templates/oceTemplate");

const createSlideStructure = (defaults, slide) => {
  const { pathToPutSlides, projectType, projectExt, imagesFolder } = defaults;
  const pathToSave = `${pathToPutSlides}/${slide.name}`;
  const path = `${pathToSave}/${slide.name}`;
  createFolder(pathToSave);
  createFolder(`${pathToSave}/${imagesFolder}`);
  switch (projectType) {
    case "Veeva":
      createAZVeevaSlide(path, slide, projectExt);
      break;
    case "React(STADA)":
      createStadaReactSlide(path, slide);
      break;
    case "React(Bayer)":
      createBayerReactSlide(path, slide);
      break;
    case "React(Abbott Multipage)":
      createAbbottMultipageReactSlide(path, slide);
      break;
    case "React(Petrovax)":
      createPetrovaxReactSlide(path, slide);
      break;
    case "MITouch":
      createMITouchVeevaSlide(path, slide, projectExt);
      break;
    case "OCE":
      createOCESlide(path, projectExt);
      break;
  }
};

module.exports = createSlideStructure;
