import yaml
import json
import requests
import bs4

with open("progression.yaml", "r") as f:
    progression = yaml.load(f, Loader=yaml.FullLoader)

points = (progression.keys())

with open("item_data.json", "r") as f:
    item_data = json.load(f)

def get_ids_from_name(name: str):
    url = f"https://terraria.wiki.gg/wiki/{name.replace(' ','_')}"
    content = str(requests.get(url).content)
    findstring = """Internal Item ID: """
    soup = bs4.BeautifulSoup(content, 'html.parser')
    content = soup.text
    ind = content.find(findstring)
    ids = []
    while ind != -1:
        ind += len(findstring)
        id = content[ind:content.find(" ",ind)]
        if id not in ids:
            ids.append(id)


        ind = content.find(findstring, ind+1)

    return ids

with open("raw_item_data/Items.json", "r") as f:
    items = json.load(f)["ItemName"]

with open("item_ids_parsed.json", "r") as f:
    item_ids = json.load(f)

for i,category in enumerate(points):
    for armor_set in progression[category]:
        ids = get_ids_from_name(armor_set)
        for id in ids:
            if id in item_data:
                print(item_data[id])
                print(f"Point in Progression: {category}")
                item_data[id]["progression"]    = category
                item_data[id]["progression_id"] = i
                item_data[id]["set_name"]       = armor_set
                item_data[id]["name"]           = items[item_ids[id]]
                item_data[id]["name_id"]        = item_ids[id]

with open("item_data_new.json", "w") as f:
    f.write(json.dumps(item_data, indent=4))