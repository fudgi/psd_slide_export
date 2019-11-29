const PSD = require("psd");
const fs = require("fs");
const path = require("path");
const imagemin = require("imagemin");
const imageminPngquant = require("imagemin-pngquant");
const sizeOf = require("image-size");
const sharp = require("sharp");
const callDir = `./psd`;
const pathToPutSlides = "./export";
const scaleRate = 2;
const layerExcludeList = ["ref", "global", "glbl"];
const layerIncludeList = ["popup", "pop_up"];
let slideName = "";
let slideWidth = 0;
let slideHeight = 0;
let layerSavedNames = [];
const beginTime = Date.now();

const createFolder = path => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
};

const findPSD = dirname => {
  const arrPsd = [];
  try {
    const arrDir = fs.readdirSync(dirname);
    arrDir.map(slide => {
      const extName = path.extname(slide);
      if (extName === ".psd") {
        arrPsd.push(slide);
      }
    });
  } catch (err) {
    console.warn("\x1b[41m", "Неверно задана папка для поиска");
    console.log("\x1b[0m");
    process.exit(1);
  }
  return arrPsd;
};
const isIncluded = (replacedName, list) =>
  list.some(item => replacedName.includes(item));

function Layer(layer) {
  const transliterate = text => {
    return (text = text
      .replace(/\u0401/g, "YO")
      .replace(/\u0419/g, "I")
      .replace(/\u0426/g, "TS")
      .replace(/\u0423/g, "U")
      .replace(/\u041A/g, "K")
      .replace(/\u0415/g, "E")
      .replace(/\u041D/g, "N")
      .replace(/\u0413/g, "G")
      .replace(/\u0428/g, "SH")
      .replace(/\u0429/g, "SCH")
      .replace(/\u0417/g, "Z")
      .replace(/\u0425/g, "H")
      .replace(/\u042A/g, "")
      .replace(/\u0451/g, "yo")
      .replace(/\u0439/g, "i")
      .replace(/\u0446/g, "ts")
      .replace(/\u0443/g, "u")
      .replace(/\u043A/g, "k")
      .replace(/\u0435/g, "e")
      .replace(/\u043D/g, "n")
      .replace(/\u0433/g, "g")
      .replace(/\u0448/g, "sh")
      .replace(/\u0449/g, "sch")
      .replace(/\u0437/g, "z")
      .replace(/\u0445/g, "h")
      .replace(/\u044A/g, "")
      .replace(/\u0424/g, "F")
      .replace(/\u042B/g, "I")
      .replace(/\u0412/g, "V")
      .replace(/\u0410/g, "a")
      .replace(/\u041F/g, "P")
      .replace(/\u0420/g, "R")
      .replace(/\u041E/g, "O")
      .replace(/\u041B/g, "L")
      .replace(/\u0414/g, "D")
      .replace(/\u0416/g, "ZH")
      .replace(/\u042D/g, "E")
      .replace(/\u0444/g, "f")
      .replace(/\u044B/g, "i")
      .replace(/\u0432/g, "v")
      .replace(/\u0430/g, "a")
      .replace(/\u043F/g, "p")
      .replace(/\u0440/g, "r")
      .replace(/\u043E/g, "o")
      .replace(/\u043B/g, "l")
      .replace(/\u0434/g, "d")
      .replace(/\u0436/g, "zh")
      .replace(/\u044D/g, "e")
      .replace(/\u042F/g, "Ya")
      .replace(/\u0427/g, "CH")
      .replace(/\u0421/g, "S")
      .replace(/\u041C/g, "M")
      .replace(/\u0418/g, "I")
      .replace(/\u0422/g, "T")
      .replace(/\u042C/g, "")
      .replace(/\u0411/g, "B")
      .replace(/\u042E/g, "YU")
      .replace(/\u044F/g, "ya")
      .replace(/\u0447/g, "ch")
      .replace(/\u0441/g, "s")
      .replace(/\u043C/g, "m")
      .replace(/\u0438/g, "i")
      .replace(/\u0442/g, "t")
      .replace(/\u044C/g, "")
      .replace(/\u0431/g, "b")
      .replace(/\u044E/g, "yu"));
  };
  const numbersInNameCheck = text => {
    const numbers = /[0-9]+$/g;
    const matched = text.match(numbers);
    const firstLetter = text[0].match(numbers);
    if ((matched && matched[0] === text) || firstLetter) {
      return `num${text}`;
    }
    return text;
  };
  const cutName = name => {
    let cutSymbols = name.replace(/[-–\*%®@\!+,\/\\?:.|><\ ]/g, "");
    if (cutSymbols.length === 0) {
      cutSymbols = `unnamed`;
    } else {
      cutSymbols = transliterate(cutSymbols).toLowerCase();
      cutSymbols = numbersInNameCheck(cutSymbols).slice(0, 15);
    }
    return cutSymbols;
  };

  this.image = layer;
  this.name = layer.name;
  this.cuttedName = cutName(layer.name);
}

const savePng = async layer => {
  const imgPath = `${pathToPutSlides}/${slideName}/img/${layer.cuttedName}`;
  const img = layer.image;
  await img.saveAsPng(`${imgPath}.png`);
  if (layer.cuttedName == "bg") await cropBackground(layer);
};

const cropBackground = async layer => {
  try {
    const imgPath = `${pathToPutSlides}/${slideName}/img/${layer.cuttedName}`;
    const img = layer.image;
    const bufferedImg = await sharp(`${imgPath}.png`)
      .extract({
        left: Math.abs(img.left),
        top: Math.abs(img.top),
        width: slideWidth - 1,
        height: slideHeight
      })
      .resize(slideWidth, slideHeight, { fit: "cover" })
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
  if (layerSavedNames.includes(layer.cuttedName)) {
    layer.cuttedName += 1;
  }
  layerSavedNames.push(layer.cuttedName);

  addJadeElement(layer);
  addCSSElement(layer);
  addJSElement(layer);
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

const getScreenSize = path => {
  const rootSize = sizeOf(path);
  slideHeight = rootSize.height;
  slideWidth = rootSize.width;
};

const parsePSD = async file => {
  const psd = PSD.fromFile(`${callDir}/${file}`);
  getScreenSize(`${callDir}/${file}`);
  psd.parse();
  slideName = file.slice(0, -4);
  const pathToSave = `${pathToPutSlides}/${slideName}`;
  createSlideStructure(pathToSave);
  await findLayer(psd.tree().children());
};

const createSlideStructure = pathToSave => {
  const createJade = pathToSave => {
    const jadeTemplate = `extends ../../blocks/layout/layout
block content
  .slide_wrapper`;
    fs.writeFileSync(`${pathToSave}/${slideName}.jade`, jadeTemplate);
  };

  const createCSS = pathToSave => {
    const CSSTemplate = `
  .slide_${slideName}{
  }`;
    fs.writeFileSync(`${pathToSave}/${slideName}.css`, CSSTemplate);
  };

  const createJS = pathToSave => {
    const JSTemplate = ``;
    fs.writeFileSync(`${pathToSave}/${slideName}.js`, JSTemplate);
  };

  createFolder(pathToPutSlides);
  createFolder(pathToSave);
  createFolder(`${pathToSave}/img`);
  createJade(pathToSave);
  createCSS(pathToSave);
  createJS(pathToSave);
};

const addJadeElement = layer => {
  if (layer.cuttedName === "bg") return;
  const path = `${pathToPutSlides}/${slideName}/${slideName}.jade`;
  const prevJadeContent = fs.readFileSync(path);
  const startIndex = prevJadeContent.indexOf(".slide_wrapper") + 14;
  const startContent = `${prevJadeContent.slice(0, startIndex)}`;
  const endContent = `${prevJadeContent.slice(startIndex)}`;
  newJade = `${startContent}
    .${layer.cuttedName} ${endContent}`;
  fs.writeFileSync(path, newJade);
};

const addCSSElement = layer => {
  const path = `${pathToPutSlides}/${slideName}/${slideName}.css`;
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
    width: width('${name}.png', ${scaleRate});
    height: height('${name}.png', ${scaleRate});
    background: resolve('${name}.png') 0 0 no-repeat;
    background-size: size('${name}.png', ${scaleRate});
    top: ${(layer.image.get("top") / scaleRate).toFixed(1)}px;
    left: ${(layer.image.get("left") / scaleRate).toFixed(1)}px;
  }`;
    const lastIndex = prevCSSContent.lastIndexOf("}");
    const fileEnd = prevCSSContent.slice(0, lastIndex);
    newCSS = `${fileEnd}${CSSElementTemplate}
}`;
  }
  fs.writeFileSync(path, newCSS);
};

const addJSElement = layer => {
  const path = `${pathToPutSlides}/${slideName}/${slideName}.js`;
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

const compressImg = slideName => {
  const path = `${pathToPutSlides}/${slideName}/img`;
  imagemin([`${path}/*.png`], {
    destination: path,
    plugins: [
      imageminPngquant({
        quality: [0.6, 0.6]
      })
    ]
  });
};

const arrPsd = findPSD(callDir);
if (arrPsd.length === 0) {
  console.warn("\x1b[41m", "В этой папке нет psd");
  console.log("\x1b[0m");
  process.exit(1);
}
console.log("Нашел", arrPsd);

async function processPSD(arrPsd) {
  for await (const file of arrPsd) {
    console.log("Работаю с :", file);
    await parsePSD(file);
    compressImg(slideName);
    if (!layerSavedNames.includes("bg")) {
      console.log(`в ${slideName} нет слоя с именем bg`);
    }
    layerSavedNames = [];
  }

  const endTime = Date.now();
  console.log(
    `Процесс завершен. Затраченное время: ${(endTime - beginTime) /
      1000} секунд`
  );
}

processPSD(arrPsd);
