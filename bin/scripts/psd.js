const PSD = require("../../lib");
const fs = require("fs");
const path = require("path");
const del = require("del");
const imagemin = require("imagemin");
const imageminPngquant = require("imagemin-pngquant");
const imageminMozjpeg = require("imagemin-mozjpeg");
const sharp = require("sharp");

const Layer = require("./Layer");
const menu = require("./menu");
const createSlideStructure = require("./createSlideStructure");
const addLayerDataToFile = require("./addLayerDataToFile");

const { createFolder, isIncluded, getScreenSize } = require("./helpers");

module.exports = function() {
  const defaults = {
    callDir: "./",
    pathToPutSlides: "./export",
    scaleRate: 2,
    projectType: "Veeva",
    imagesFolder: "",
    layerExcludeList: ["ref", "global", "glbl"],
    layerIncludeList: ["popup", "pop_up"]
  };
  let beginTime;
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
      process.exit(0);
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
      process.exit(0);
    }
    return arrPsd;
  };

  const savePng = async layer => {
    const imgPath = `${defaults.pathToPutSlides}/${slide.name}/${defaults.imagesFolder}/${layer.cuttedName}`;
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
      const imgPath = `${defaults.pathToPutSlides}/${slide.name}/${defaults.imagesFolder}/${layer.cuttedName}`;
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

      await sharp(bufferedImg)
        .jpeg({
          quality: 100,
          chromaSubsampling: "4:4:4"
        })
        .toFile(`${imgPath}.jpg`);
    } catch (err) {
      console.log("Ошибка в попытке обрезать бэкграунд: ", err);
      console.log(`Не получилось кропнуть ${layer.name}.png`);
    }
  };

  const layerSave = async layer => {
    if (slide.layerSavedNames.includes(layer.cuttedName)) {
      layer.cuttedName += 1;
    }
    slide.layerSavedNames.push(layer.cuttedName);

    addLayerDataToFile(layer, defaults, slide);
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
      !isIncluded(node.cuttedName, defaults.layerExcludeList)) ||
    isIncluded(node.cuttedName, defaults.layerIncludeList);

  const parsePSD = async file => {
    const path = `${defaults.callDir}/${file}`;
    const psd = PSD.fromFile(path);
    slide.size = getScreenSize(path);

    psd.parse();
    slide.name = file.slice(0, -4);
    if (slide.name[0].match(/[0-9]+$/g))
      console.warn(
        `Название макета начинается или состоит из цифр. Нехорошо это. Обрати внимание`
      );

    createSlideStructure(defaults, slide);
    await findLayer(psd.tree().children());
  };

  const compressImg = slideName => {
    const path = `${defaults.pathToPutSlides}/${slideName}/img`;
    return imagemin([`${path}/*.{jpg,png}`], {
      destination: path,
      plugins: [
        imageminMozjpeg({ quality: 90, progressive: true, smooth: 50 }),
        imageminPngquant({
          strip: true,
          quality: [0.6, 0.8]
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
  };

  const start = async () => {
    del.sync([defaults.pathToPutSlides]);
    Promise.all([menu(), findPSD(defaults.callDir)]).then(async result => {
      defaults.projectType = result[0];
      defaults.imagesFolder =
        defaults.projectType === "MITouch(Danone)" ? "images" : "img";
      arrPsd = result[1];
      console.log("Нашел:", arrPsd);
      createFolder(defaults.pathToPutSlides);
      beginTime = Date.now();
      await processPSDs(arrPsd);
    });
  };
  process.on("exit", () => {
    if (beginTime) {
      const endTime = Date.now();
      console.log(
        `Процесс завершен. Затраченное время: ${(endTime - beginTime) /
          1000} секунд`
      );
    }
  });

  start();
};
