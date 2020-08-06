const checkSubStr = (text, file) => {
  if (
    text.search(/[А-Яа-я]\d\./gi) !== -1 ||
    text.search(/[А-Яа-я]\d-\d/gi) !== -1 ||
    text.search(/[А-Яа-я]\d,\d/gi) !== -1 ||
    text.search(/[A-Za-z]\d[A-Za-z]/gi) !== -1
  ) {
    console.warn(
      "\x1b[35m",
      `загляни в макет возможно ты найдешь sup/sub-строки в рефах`
    );
    console.log("\x1b[0m");
  }
};

const checkValidLayer = (layer) => Boolean(layer.image.text.value);

const createRef = (text) => {
  let strRef = text.replace(/\u0003/g, "</br>");
  strRef = strRef.split(/\r/g);
  strRef = strRef.filter((el) => Boolean(el.trim()));
  return strRef;
};

const exportRef = (layer) => {
  if (!checkValidLayer(layer))
    console.log(`слой ref - это графический слой, а не текст`);
  else {
    const text = layer.image.text.value;
    checkSubStr(text);
    return createRef(text);
  }
};

module.exports = exportRef;
