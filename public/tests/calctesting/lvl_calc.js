let BEWD = 
{
    name: "Blue-Eyes White Dragon",
    portrait: "./assets/BEWD.png",//<--Temporary porttrait
    class: "Dragon",
    hp: 1900,
    atk: 3000,
    def: 2500,
    ap: 2,
    gt: 2,
    luck: 5,
    speed: 180,
    battleArt: "Dragon-Killer 2 (20)",
    specialName: "-",
    specialDesc: "-",
    ability1: "Mountain Adept (1)",
    ability2: "Castle Adept (15)",
    ability3: "Armor (35)"
}

//HP: monster.HP + GT * (level - 1),
// ATK: monster.ATK + GT * (level - 1),
// DEF: monster.DEF + GT * (level - 1),
// AP: monster.AP

function calcTest(monster, level) {
    Atk = monster.atk + atkCalc(monster.gt, level)
    Ap = monster.ap + apCalc(monster.ap, level)
    console.log(Atk);
    console.log(Ap);
    let stats = []
    stats.push(Atk, Ap);
    return stats;
}


function atkCalc(GT, level) {
    sum = 0
    level = level - 1
    if (GT = 2){
        if (level > 0 && level <= 29) {
            for (let i=1; i <= level; i++) {
                sum += 28;
            }
            return sum;
        } else if (level > 29 && level <= 59) {
            for (let i=1; i <= level; i++) {
                if (i <= 29) {
                    sum += 28;
                } else {
                    sum += 28;
                }
            }
            return sum;
        } else if (level > 59 && level <= 98) {
            for (let i=1; i <= level; i++) {
                if (i <= 29) {
                    sum += 28;
                } else if (i <= 59) {
                    sum += 28;
                } else {
                    sum += 11;
                }
            }
            return sum;
        } else {
        return sum;
        }
    }
}

function apCalc(GT, level) {
    sum = 0
    level = level - 1
    if (GT = 2) {
        for (let i=1; i <= level; i++){
            if (i === 10) {
                sum++;
            } else if (i === 20) {
                sum++;
            } else if (i === 30) {
                sum++;
            } else if (i === 36) {
                sum++;
            }
        }
        return sum;
    }
}

result = calcTest(BEWD, 20);
console.log(`Atk: ${result[0]}, AP: ${result[1]}`);