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

const SCORE_CUTOFF = 3;

const ITEM_IDS = require("./item_ids_parsed.json");
const ITEMS = require("./raw_item_data/Items.json").ItemName;

function findBestSet(sf, progressionId = 0) {
    const armorsHead = [];
    const armorsBody = [];
    const armorsLegs = [];

    const items = require("./item_data_new.json");
    
    for (const id in items) {
        const val = items[id];
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
    
    for (const combination of product(...s)) {
        const score = getArmorSetScore(combination, sf);
        if (score > bestScore) {
            bestScore = score;
            bestSet = combination;
        }
    }

    console.log(bestScore)

    return bestSet;
}

function getItemName(id) {
    return ITEMS[ITEM_IDS[id]];
}

function stringArmorSet(armorSet) {
    return armorSet.map(armor => getItemName(armor.id)).join(", ");
}

function main() {
    console.log(stringArmorSet(findBestSet(getScoreFunctions(scales))))
    

}

if (require.main === module) {
    main();
}
