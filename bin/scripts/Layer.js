function Layer(layer) {
  const numbersInNameCheck = (text) => {
    //имя не должно начинаться или состоять из цифр
    const numbers = /[0-9]+$/g;
    const matched = text.match(numbers);
    const firstLetter = text[0].match(numbers);
    if ((matched && matched[0] === text) || firstLetter) {
      return `num${text}`;
    }
    return text;
  };
  const checkName = (name) => {
    let cuttedLine = name.replace(/[^a-zA-Z0-9.()=""``''_-]/g, "");
    if (cuttedLine.length === 0) {
      cuttedLine = `unnamed`;
      // console.log(`слой ${this.name} был переименован в "unnamed"`);
    } else {
      cuttedLine = numbersInNameCheck(cuttedLine);
    }
    return cuttedLine[0] == "." ? cuttedLine.substring(1) : cuttedLine;
  };

  const getDataAttributes = (name) => {
    const attributeRegEx = new RegExp(/(?<=\().+?(?=\))/g);
    const result = name.match(attributeRegEx);
    return result ? result : undefined;
  };
  const getClasses = (name, attributes = []) => {
    const curledAttribute = attributes.map((item) => `\\(${item}\\)`);
    const classesRegEx = new RegExp(curledAttribute.join("|"), "gi");
    const clearedClassesLine = name.replace(classesRegEx, "");
    return clearedClassesLine.split(".").filter((item) => item);
  };

  this.image = layer;
  this.name = layer.name;
  const checkedName = checkName(this.name);
  this.attributes = getDataAttributes(checkedName);
  this.classes = getClasses(checkedName, this.attributes);
  this.cuttedName = this.classes[0].toLowerCase();
}

module.exports = Layer;
