const PSD = require("psd");
const fs = require("fs");
const path = require("path");
const del = require("del");
const imagemin = require("imagemin");
const imageminPngquant = require("imagemin-pngquant");

const sharp = require("sharp");
const Layer = require("./scripts/Layer");
const menu = require("./scripts/menu");
const createSlideStructure = require("./scripts/slideStructure");
const {
  createFolder,
  isIncluded,
  getScreenSize
} = require("./scripts/helpers");

const defaults = {
  callDir: "./psd",
  pathToPutSlides: "./export",
  scaleRate: 2,
  projectType: "Veeva"
};
const layerExcludeList = ["ref", "global", "glbl"];
const layerIncludeList = ["popup", "pop_up"];
const beginTime = Date.now();

let arrPsd = [];
let slide = {
  name: "",
  size: { height: 0, width: 0 },
  layerSavedNames: []
};

const findPSD = dirname => {
  const arrPsd = [];
  let folderFilesList = [];

  try {
    folderFilesList = fs.readdirSync(dirname);
  } catch (err) {
    console.warn("\x1b[41m", "Неверно задана папка для поиска");
    console.log("\x1b[0m");
    process.exit(1);
  }

  folderFilesList.forEach(slide => {
    const extName = path.extname(slide);
    if (extName === ".psd") {
      arrPsd.push(slide);
    }
  });

  if (arrPsd.length === 0) {
    console.warn("\x1b[41m", "В этой папке нет psd");
    console.log("\x1b[0m");
    process.exit(1);
  }
  return arrPsd;
};

const savePng = async layer => {
  const imgPath = `${defaults.pathToPutSlides}/${slide.name}/img/${layer.cuttedName}`;
  const img = layer.image;
  try {
    await img.saveAsPng(`${imgPath}.png`);
  } catch (err) {
    console.log(`не могу сохранить слой ${layer.name}`);
    console.log(err);
  }
  if (layer.cuttedName == "bg") await cropBackground(layer);
};

const cropBackground = async layer => {
  try {
    const imgPath = `${defaults.pathToPutSlides}/${slide.name}/img/${layer.cuttedName}`;
    const bufferedImg = await sharp(`${imgPath}.png`)
      .extract({
        left: Math.abs(layer.image.left),
        top: Math.abs(layer.image.top),
        width: slide.size.width - 1,
        height: slide.size.height
      })
      .resize(slide.size.width, slide.size.height, { fit: "cover" })
      .toBuffer();

    fs.unlink(`${imgPath}.png`, err => {
      if (err) console.log(`Не смог удалить ${imgPath}.png`, err);
    });

    sharp(bufferedImg)
      .jpeg({
        quality: 60,
        chromaSubsampling: "4:4:4"
      })
      .toFile(`${imgPath}.jpg`);
  } catch (err) {
    console.log(`Не получилось кропнуть ${imgPath}.png`);
  }
};

const layerSave = async layer => {
  if (slide.layerSavedNames.includes(layer.cuttedName)) {
    layer.cuttedName += 1;
  }
  slide.layerSavedNames.push(layer.cuttedName);

  addLayerDataToFile(layer);
  await savePng(layer);
};

const findLayer = async nodes => {
  for (const node of nodes) {
    const layer = new Layer(node);
    if (isExportable(layer)) {
      if (node.isLayer()) await layerSave(layer);
      if (node.isGroup()) await findLayer(node.children());
    }
  }
};

const isExportable = node =>
  (node &&
    node.image.visible() &&
    !isIncluded(node.cuttedName, layerExcludeList)) ||
  isIncluded(node.cuttedName, layerIncludeList);

const parsePSD = async file => {
  const path = `${defaults.callDir}/${file}`;
  const psd = PSD.fromFile(path);
  slide.size = getScreenSize(path);

  psd.parse();
  slide.name = file.slice(0, -4);
  if (slide.name[0].match(/[0-9]+$/g))
    console.warn(
      `Название макета полностью состоит из цифр. Нехорошо это. Обрати внимание`
    );

  createSlideStructure(defaults, slide);
  await findLayer(psd.tree().children());
};

const addLayerDataToFile = layer => {
  const addJadeElement = () => {
    if (layer.cuttedName === "bg") return;
    const path = `${defaults.pathToPutSlides}/${slide.name}/${slide.name}.jade`;
    const prevJadeContent = fs.readFileSync(path);
    const startIndex = prevJadeContent.indexOf(".slide_wrapper") + 14;
    const startContent = prevJadeContent.slice(0, startIndex);
    const endContent = prevJadeContent.slice(startIndex);
    newJade = `${startContent}
    .${layer.cuttedName} ${endContent}`;
    fs.writeFileSync(path, newJade);
  };

  const addCSSElement = () => {
    const path = `${defaults.pathToPutSlides}/${slide.name}/${slide.name}.css`;
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
    .${name}{${isIncluded(name, layerIncludeList) ? `\n\t\tdisplay: none;` : ``}
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
    const path = `${defaults.pathToPutSlides}/${slide.name}/${slide.name}.js`;
    const prevJSContent = fs.readFileSync(path);
    if (
      isIncluded(layer.cuttedName, layerIncludeList) &&
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
    const path = `${defaults.pathToPutSlides}/${slide.name}/${slide.name}.js`;
    const prevJSContent = fs.readFileSync(path);
    const startIndex = prevJSContent.indexOf("scale-wrapper") + 15;
    const startContent = prevJSContent.slice(0, startIndex);
    const endContent = prevJSContent.slice(startIndex);
    newJSX = `${startContent}
          <div className='${layer.cuttedName}'/> ${endContent}`;
    fs.writeFileSync(path, newJSX);
  };

  const addReactSCSSElement = () => {
    const path = `${defaults.pathToPutSlides}/${slide.name}/${slide.name}.scss`;
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
  .${name}{${isIncluded(name, layerIncludeList) ? `\n\t\tdisplay: none;` : ``}
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
    const path = `${defaults.pathToPutSlides}/${slide.name}/${slide.name}.css`;
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
        isIncluded(name, layerIncludeList) ? `\n\t\tdisplay: none;` : ``
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

const compressImg = slideName => {
  const path = `${defaults.pathToPutSlides}/${slideName}/img`;
  imagemin([`${path}/*.png`], {
    destination: path,
    plugins: [
      imageminPngquant({
        quality: [0.6, 0.6]
      })
    ]
  });
};

const processPSDs = async arrPsd => {
  for await (const file of arrPsd) {
    console.log("Работаю с :", file);
    await parsePSD(file);
    compressImg(slide.name);
    if (!slide.layerSavedNames.includes("bg")) {
      console.warn(`\u2191 в ${slide.name} нет слоя с именем bg`);
    }
    slide.layerSavedNames = [];
  }

  const endTime = Date.now();
  console.log(
    `Процесс завершен. Затраченное время: ${(endTime - beginTime) /
      1000} секунд`
  );
};

const start = async () => {
  del.sync([defaults.pathToPutSlides]);
  Promise.all([menu(), findPSD(defaults.callDir)]).then(result => {
    defaults.projectType = result[0];
    arrPsd = result[1];
    console.log("Нашел:", arrPsd);
    createFolder(defaults.pathToPutSlides);
    processPSDs(arrPsd);
  });
};

start();
