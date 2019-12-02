const fs = require("fs");
const sizeOf = require("image-size");

const createFolder = path => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
};

const isIncluded = (replacedName, list) =>
  list.some(item => replacedName.includes(item));

const getScreenSize = path => ({
  height: sizeOf(path).height,
  width: sizeOf(path).width
});

module.exports = { createFolder, isIncluded, getScreenSize };
