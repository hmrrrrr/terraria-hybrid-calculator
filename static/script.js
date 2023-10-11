const Slot = {
    HEAD: 1,
    BODY: 2,
    LEGS: 3,
};

const scales = {
    defense: 1,
    meleeDamage: 100,
    meleeCrit: 1,
    rangedDamage: 100,
    rangedCrit: 1,
    magicDamage: 100,
    magicCrit: 1,
    minionDamage: 100,
    maxMinions: 10,
    meleeSpeed: 50,
    moveSpeed: 0.01,
    statManaMax2: 0.1,
    manaCost: 100,
};

function makeLinear(scale) {
    return function (x) {
        return x * scale;
    };
}

function getScoreFunctions(s) {
    const scoreFunctions = {};
    for (const key in s) {
        scoreFunctions[key] = makeLinear(s[key]);
    }
    return scoreFunctions;
}


class Armor {
    constructor(id, d) {
        this.slot =
            "headSlot" in d
                ? Slot.HEAD
                : "bodySlot" in d
                    ? Slot.BODY
                    : "legSlot" in d
                        ? Slot.LEGS
                        : null;
        this.properties = d.properties || {};
        this.properties.defense = { value: d.defense, sign: "+" };
        this.progressionId = d.progression_id;
        if(this.progressionId === undefined) {
            this.progressionId = 100;
        }
        this.id = id;
        this.name = d.name;
        this.name_id = d.name_id;
    }

    getPropertyValue(prop) {
        if (prop in this.properties) {
            return this.properties[prop].value;
        }
    }

    getScore(sf) {
        let score = 0;
        for (const prop in this.properties) {
            if (prop in sf) {
                score += sf[prop](this.getPropertyValue(prop));
            }
        }
        return score;
    }
}

function getArmorSetScore(armorSet, sf) {
    const summedDict = {};
    armorSet.forEach(armor => {
        for (const prop in armor.properties) {
            if (prop in summedDict) {
                summedDict[prop].value += armor.getPropertyValue(prop);
            } else {
                summedDict[prop] = Object.assign({}, armor.properties[prop]);
            }
        }
    });

    let score = 0;
    for (const prop in summedDict) {
        if (prop in sf) {
            score += sf[prop](summedDict[prop].value);
        }
    }

    return score;
}
function loadFile(filePath) {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, false);
    xmlhttp.send();
    if (xmlhttp.status==200) {
      result = xmlhttp.responseText;
    }
    return result;
  }
function product() {
    var args = Array.prototype.slice.call(arguments); // makes array from arguments
    return args.reduce(function tl (accumulator, value) {
      var tmp = [];
      accumulator.forEach(function (a0) {
        value.forEach(function (a1) {
          tmp.push(a0.concat(a1));
        });
      });
      return tmp;
    }, [[]]);
  }

const SCORE_CUTOFF = 6;

const ITEM_IDS = JSON.parse(loadFile("item_ids_parsed.json"));
const ITEMS = JSON.parse(loadFile("raw_item_data/Items.json")).ItemName;


function findBestSets(sf, progressionId = 0, n = 3) {
    const armorsHead = [];
    const armorsBody = [];
    const armorsLegs = [];

    const items = JSON.parse(loadFile("static/item_data_new.json"))
    for (let id in items) {
        var val = items[id];
        const armor = new Armor(id, val);
        if (armor.progressionId > progressionId) {
            continue;
        }

        if (armor.slot === Slot.HEAD) {
            armorsHead.push(armor);
        } else if (armor.slot === Slot.BODY) {
            armorsBody.push(armor);
        } else if (armor.slot === Slot.LEGS) {
            armorsLegs.push(armor);
        }
    }

    armorsHead.sort((a, b) => b.getScore(sf) - a.getScore(sf));
    armorsBody.sort((a, b) => b.getScore(sf) - a.getScore(sf));
    armorsLegs.sort((a, b) => b.getScore(sf) - a.getScore(sf));

    const s = [armorsHead.slice(0, SCORE_CUTOFF), armorsBody.slice(0, SCORE_CUTOFF), armorsLegs.slice(0, SCORE_CUTOFF)];

    let bestScore = -543543;
    let bestSet = null;
    
    let sets = [];

    for (const combination of product(...s)) {
        const score = getArmorSetScore(combination, sf);
        sets.push(combination);
        if (score > bestScore) {
            bestScore = score;
            bestSet = combination;
        }
    }

    sets.sort((a, b) => getArmorSetScore(b, sf) - getArmorSetScore(a, sf));

    return sets.slice(0, n);
}

function getItemName(id) {
    return ITEMS[ITEM_IDS[id]];
}

function stringArmorSet(armorSet) {
    return armorSet.map(armor => getItemName(armor.id)).join(", ");
}

function stringArmorSets(armorSets) {
    return armorSets.map(armorSet => stringArmorSet(armorSet)).join("\n");
}
function main() {
    console.log(stringArmorSets(findBestSets(
        getScoreFunctions(scales),0,5)))
}

