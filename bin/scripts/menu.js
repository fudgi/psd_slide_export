const readline = require("readline");
const projectTypes = [
  "Veeva",
  "React(STADA)",
  "React(Bayer)",
  "React(Abbott Multipage)",
  "MITouch(Danon)"
];

async function menu() {
  try {
    return await takeAnsw();
  } catch (err) {
    console.log(err);
  }
  function takeAnsw() {
    return new Promise((resolve, reject) => {
      const welcomeMessage =
        "\nВыберите тип проекта:\n" +
        projectTypes
          .map((el, index) => "" + (index + 1) + ". " + el)
          .join("\n") +
        "\n\n";
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      rl.question(welcomeMessage, answer => {
        const answArr = projectTypes.map((el, index) => index + 1);
        if (~answArr.indexOf(+answer)) {
          rl.close();
          resolve(projectTypes[answer - 1]);
        } else {
          rl.close();
          reject("Введен неверный тип проекта");
        }
      });
    });
  }
}

module.exports = menu;
