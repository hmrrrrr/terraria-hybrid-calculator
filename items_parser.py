import re
import json

def parse(filepath: str) -> dict:
    with open(filepath + "/Item.cs", "r") as f:
        lines_item = f.readlines()
    with open(filepath + "/Player.cs", "r") as f:
        lines_player = f.readlines()

    items = {}

    pattern = re.compile(r"armorPiece\.type == (\d+)")
    for i,v in [(i,v) for i,v in enumerate(lines_item) if "case" in v]:
        item = {}
        s0 = re.search(r"case (\d+):", v)
        if s0:
            case_number = s0.group(1)
        else:
            continue
        
        for line in lines_item[i+1:]:
            if "case" in line:
                break
            # get property to the left of the =
            s1 = re.search(r"(\w+) =", line)
            if s1:
                prop = s1.group(1)
        
                s2 = re.search(r"= (.+);", line)
                if s2:
                    value = s2.group(1)
                
                if item_property_filter(prop):
                    if value.isnumeric():
                        value = int(value)
                    item[prop] = value
            

        if item_filter(item):
            items[int(case_number)] = item
    
    handled_nums = []
    for i,v in [(i,v) for i,v in enumerate(lines_player) if ("case" in v) or ("armorPiece.type" in v)]:
        properties = {}
        s0 = re.search(r"case (\d+):", v)

        def do(num):
            for line in lines_player[i+1:]:
                if ("case" in line) or ("armorPiece.type" in line):
                    break
                # get property to the left of the =
                s1 = re.search(r"(\w+) ([\+\-\*])?=", line)
                sign = None
                value = None
                if s1 is None:
                    s1 = re.search(r"(\w+)++", line)
                    if s1:
                        sign = "+"
                        value = 1
                    else:
                        sign = None
                        value = None
                if s1:
                    
                    prop = s1.group(1)
                    if sign is None:
                        sign = s1.group(2)
                    
                    if value is None:
                        s2 = re.search(r"= (.+);", line)
                        if s2:
                            value = s2.group(1)
                        else:
                            value = None
                            print("no value found for", prop)
                        s3 = re.search(r"(\d.+)f", value)
                        if s3:
                            value = float(s3.group(1))
                        elif value.isnumeric():
                            value = int(value)

                    properties[prop] = {
                        "value": value,
                    }
                    properties[prop]["sign"] = sign if sign else "="
            if int(num) in items.keys():
                items[int(num)]["properties"] = properties

        if s0:
            case_number = s0.group(1)
            do(case_number)
        else:
            j = 0
            case_number = -1
            noresult = False
            while True:
                s4 = pattern.search(v[min(j,len(v)-1):])
                if s4:
                    case_number = s4.group(1)
                    j += 1
                    do(case_number)
                    handled_nums.append(int(case_number))
                else:
                    noresult = True
                    break
            if noresult:
                continue
            



    json_data = json.dumps(items, indent=4)

    return json_data



def item_filter(item: dict) -> bool:
    return "defense" in item.keys()

def item_property_filter(property: str) -> bool:
    return property in [
        "defense","headSlot","bodySlot","legSlot"
    ]

def main():
    json_data = parse("raw_item_data")

    with open("item_data.json", "w") as f:
        f.write(json_data)

if __name__ == "__main__":
    main()