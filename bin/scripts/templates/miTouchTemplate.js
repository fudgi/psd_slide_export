const fs = require("fs");

const createMITouchVeevaSlide = (path, slide, extension) => {
  const createMITouchHTML = () => {
    const HTMLTemplate = `extends ../../blocks/layout/layout
block content`;
    fs.writeFileSync(`${path}.${extension}`, HTMLTemplate);
  };

  const createMITouchCSS = () => {
    const CSSTemplate = `.slide{
}`;
    fs.writeFileSync(`${path}.css`, CSSTemplate);
  };

  const createMITouchJS = () => {
    const JSTemplate = ``;
    fs.writeFileSync(`${path}.js`, JSTemplate);
  };

  const createParameters = () => {
    const XMLTemplate = `<?xml version="1.0" encoding="utf-8"?>
<Sequence Id="{{pres_name}}_${slide.name}" Orientation="Landscape" xmlns="urn:param-schema">
</Sequence>`;
    fs.mkdirSync(`./export/${slide.name}/parameters`);
    fs.writeFileSync(
      `./export/${slide.name}/parameters/parameters.xml`,
      XMLTemplate
    );
  };

  const createExport = () => {
    fs.mkdirSync(`./export/${slide.name}/export`);
    fs.writeFileSync(`./export/${slide.name}/export/export.pdf`);
  };

  createMITouchHTML();
  createMITouchCSS();
  createMITouchJS();
  createParameters();
  createExport();
};

module.exports = { createMITouchVeevaSlide };
