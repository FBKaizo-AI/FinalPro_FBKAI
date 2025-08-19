import { Monsters } from "./assets/monsters.js";

const Growths = {
    0: {
        atkDef: [35, 30, 15], // level ups [1-29, 30-59, 60-98]
        hp: [23, 14, 10], // level ups [1-29, 30-59, 60-98]
        apLevels: [10, 16, 24, 35, 40] // AP increases at these levels
    },
    1: {
        atkDef: [40, 24, 15],
        hp: [26, 7, 7],
        apLevels: [10, 15, 20, 30]
    },
    2: {
        atkDef: [28, 28, 11],
        hp: [18, 11, 10],
        apLevels: [10, 20, 30, 36]
    },
    3: {
        atkDef: [30, 15, 18],
        hp: [12, 9, 6],
        apLevels: [10, 16, 30, 36, 45]
    },
    4: {
        atkDef: [24, 24, 18],
        hp: [34, 8, 6],
        apLevels: [10, 15, 20, 40, 50]
    },
    5: {
        atkDef: [50, 32, 18],
        hp: [16, 14, 10],
        apLevels: [5, 10, 15, 20, 30]
    },
    6: {
        atkDef: [31, 31, 31],
        hp: [30, 3, 3],
        apLevels: [5, 10, 15, 20, 25]
    },
    7: {
        atkDef: [38, 37, 10],
        hp: [18, 18, 6],
        apLevels: [10, 15, 20, 30]
    },
    8: {
        atkDef: [36, 34, 8],
        hp: [18, 16, 6],
        apLevels: [5, 10, 20, 36, 45, 50]
    },
    9: {
        atkDef: [20, 20, 20],
        hp: [22, 16, 8],
        apLevels: [15, 20, 30, 36, 45, 54]
    },
    10: { // growth tree A
        atkDef: [32, 25, 22],
        hp: [16, 10, 5],
        apLevels: [5, 10, 20, 24]
    },
    11: { // growth tree B
        atkDef: [53, 30, 14],
        hp: [14, 13, 8],
        apLevels: [5, 10, 25, 30]
    },
    12: { // growth tree C
        atkDef: [30, 24, 15],
        hp: [14, 10, 10],
        apLevels: [15, 20, 30, 36, 50]
    },
    13: { // growth tree D
        atkDef: [31, 20, 16],
        hp: [30, 16, 6],
        apLevels: [5, 10, 24, 36]
    },
    14: { // growth tree E
        atkDef: [57, 40, 5],
        hp: [22, 22, 5],
        apLevels: [10, 16, 30, 35, 40]
    },
    15: { // growth tree F
        atkDef: [56, 21, 21],
        hp: [24, 12, 10],
        apLevels: [5, 10, 20, 24, 40]
    },
    16: { // growth tree 10
        atkDef: [31, 30, 20],
        hp: [10, 10, 10],
        apLevels: [10, 15, 20, 30, 35, 40]
    },
    17: { // growth tree 11
        atkDef: [18, 18, 18],
        hp: [11.5, 11.5, 11.5], // round decimals up
        apLevels: [5, 10, 20, 30, 40, 50]
    },
    18: { // growth tree 12
        atkDef: [28, 22, 20],
        hp: [17, 16, 10],
        apLevels: [10, 20, 30, 40]
    },
    19: { // growth tree 13
        atkDef: [30, 30, 30],
        hp: [14, 14, 10],
        apLevels: [10, 15, 20, 24]
    },
    20: { // growth tree 14
        atkDef: [20, 20, 14],
        hp: [30, 20, 6],
        apLevels: [5, 10, 24, 35, 40]
    },
    21: { // growth tree 15
        atkDef: [62, 30, 10],
        hp: [10, 6, 6],
        apLevels: [5, 10, 24, 36]
    },
    22: { // growth tree 16
        atkDef: [34, 30, 14],
        hp: [30, 15, 10],
        apLevels: [10, 16, 24, 36, 50]
    },
    23: { // growth tree 17
        atkDef: [80, 30, 14],
        hp: [20, 10, 8],
        apLevels: [15, 20, 30, 40, 50]
    },
};



// base function for calculations
function calc(monster, level) {
    let Hp = monster.hp + hpCalc(monster.gt, level)
    let Atk = monster.atk + atkDefCalc(monster.gt, level)
    let Def = monster.def + atkDefCalc(monster.gt, level)
    let Ap = monster.ap + apCalc(monster.gt, level)

    
    let stats = []
    stats.push(Math.ceil(Hp), Atk, Def, Ap); //the math.ceil is added due to index 17 of Growths having 11.5 as a growth
    // console.log(stats)
    return stats;
}


// calculates hp growth
function hpCalc(GT, level) {
  const growth = Growths[GT];
  let sum = 0;
  level = level - 1;
  for (let i = 1; i <= level; i++) {
    if (i <= 29) sum += growth.hp[0];
    else if (i <= 59) sum += growth.hp[1];
    else sum += growth.hp[2];
  }
  return sum;
}


// calculates atk/def growth
function atkDefCalc(GT, level) {
  const growth = Growths[GT];
  let sum = 0;
  level = level - 1;
  for (let i = 1; i <= level; i++) {
    if (i <= 29) sum += growth.atkDef[0];
    else if (i <= 59) sum += growth.atkDef[1];
    else sum += growth.atkDef[2];
  }
  return sum;
}


//calculates ap growth
function apCalc(GT, level) {
    const growth = Growths[GT];
    let sum = 0;
    for (let i = 1; i < level; i++) {
        if (growth.apLevels.includes(i)) {
            sum++;
        }
    }
    return sum;
}

// below comment was used in testing
// calculator inputs (Monster, Level)
// result = calc(BEWD, 80);
// console.log(`Hp: ${result[0]}, Atk: ${result[1]}, Def: ${result[2]}, AP: ${result[3]}`);

export {calc, hpCalc, atkDefCalc, apCalc};
