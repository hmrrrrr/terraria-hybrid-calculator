from enum import Enum
import json
import itertools
import math

class Slot(Enum):
    HEAD = 1
    BODY = 2
    LEGS = 3

scales = {
    "defense": 1,
    "meleeDamage": 100,
    "meleeCrit": 1,
    "rangedDamage": 100,
    "rangedCrit": 1,
    "magicDamage": 100,
    "magicCrit": 1,
    "minionDamage": 100,
    "maxMinions": 10,
    "meleeSpeed": 50,
    "moveSpeed": 0.01,
    "statManaMax2": 0.1,
    "manaCost": 100
}


def make_linear(scale: float):
    def f(x):
        return x * scale
    return f

def get_score_functions(s):
    d = {
        key: make_linear(scale) for key, scale in s.items()
    }
    return d

score_functions = get_score_functions(scales)

class Armor:
    def __init__(self, id, d) -> None:
        self.slot = (
            Slot.HEAD if "headSlot" in d.keys() else
            Slot.BODY if "bodySlot" in d.keys() else
            Slot.LEGS if "legSlot"  in d.keys() else None
        )
        self.properties = d["properties"] if "properties" in d else {}
        self.properties["defense"] = {"value": d["defense"], "sign": "+"}
        self.progression_id = d["progression_id"] if "progression_id" in d.keys() else 100
        self.id = id
    def get_property_value(self,prop: str):
        if prop in self.properties.keys():
            return self.properties[prop]["value"]
        

    def get_score(self, sf):
        score = 0
        for prop, val in self.properties.items():
            if prop in sf.keys():
                score += sf[prop](self.get_property_value(prop))
        return score

def get_armor_set_score(armor_set: list[Armor], sf) -> float:
    summed_dict = {}
    for armor in armor_set:
        for prop, val in armor.properties.items():
            if prop in summed_dict.keys():
                summed_dict[prop]["value"] += armor.get_property_value(prop)
            else:
                summed_dict[prop] = dict(val) #VERY IMPORNANT TO COPY THE DICT AND NOT JUST REFERENCE IT OR ELSE IT WILL BE CHANGED IN THE ORIGINAL DICT TOO AND THAT IS BAD AND WILL MAKE YOU SAD AND CRY AND DIE AND BE SAD 
    
    score = 0
    for prop, val in summed_dict.items():
        if prop in sf.keys():
            score += sf[prop](val["value"])
    
    return score

SCORE_CUTOFF = 3

with open("item_ids_parsed.json", "r") as f:
    ITEM_IDS: dict = json.load(f)

with open("raw_item_data/Items.json", "r") as f:
    ITEMS: dict = json.load(f)["ItemName"]

def main():
    pass

def find_best_set(sf, progression_id: int = 0):
    armors_head = []
    armors_body = []
    armors_legs = []

    with open("item_data_new.json", "r") as f:
        items: dict = json.load(f)
    
    
    for id, val in items.items():
        armor = Armor(id,val)
        if armor.progression_id > progression_id:
            continue

        if armor.slot == Slot.HEAD:
            armors_head.append(armor)
        elif armor.slot == Slot.BODY:
            armors_body.append(armor)
        elif armor.slot == Slot.LEGS:
            armors_legs.append(armor)

    # Sort each armor list by score

    armors_head.sort(key=lambda x: x.get_score(sf), reverse=True)
    armors_body.sort(key=lambda x: x.get_score(sf), reverse=True)
    armors_legs.sort(key=lambda x: x.get_score(sf), reverse=True)

    # Keep only the top 20 pieces for each armor slot
    armors_head = armors_head[:SCORE_CUTOFF]
    armors_body = armors_body[:SCORE_CUTOFF]
    armors_legs = armors_legs[:SCORE_CUTOFF]

    s = [armors_head, armors_body, armors_legs]

    best_score = -math.inf 
    best_set = None
    for combination in (itertools.product(*s)):
        score = get_armor_set_score(combination,sf)
        if score > best_score:
            best_score = score
            best_set = combination
    
    return best_set

def get_item_name(id: int) -> str:
    return ITEMS[ITEM_IDS[id]]

def string_armor_set(armor_set: list[Armor]):
    return ", ".join([get_item_name(armor.id) for armor in armor_set])

if __name__ == "__main__":
    main()
    

    
