const readline = require("readline");
const projectTypes = [
  "Veeva",
  "MITouch",
  "OCE",
  "React(STADA)",
  "React(Bayer)",
  "React(Abbott Multipage)",
  "React(Petrovax)",
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
        projectTypes.map((el, index) => `${index + 1}. ${el}`).join("\n") +
        "\n\n";
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question(welcomeMessage, (answer) => {
        const answArr = projectTypes.map((el, index) => index + 1);
        if (~answArr.indexOf(+answer)) {
          const projectType = projectTypes[answer - 1];
          const isMPA = projectTypes
            .filter((type) => !type.includes("React"))
            .includes(projectType);

          if (isMPA) {
            const extensions = ["Jade", "Pug"];
            const extnesionChoice =
              "\nКакой формат файла нужен?\n" +
              extensions.map((el, index) => `${index + 1}. ${el}`).join("\n") +
              "\n\n";
            rl.question(extnesionChoice, (answer) => {
              const answArr = extensions.map((el, index) => index + 1);
              if (~answArr.indexOf(+answer)) {
                const projectExt = extensions[answer - 1].toLowerCase();
                rl.close();
                resolve({ projectType, projectExt });
              } else {
                rl.close();
                reject("Выбран несуществующий формат");
              }
            });
          } else {
            rl.close();
            resolve({ projectType });
          }
        } else {
          rl.close();
          reject("Введен неверный тип проекта");
        }
      });
    });
  }
}

module.exports = menu;
