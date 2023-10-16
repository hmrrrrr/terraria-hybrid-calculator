import requests as re
import json
import asyncio
import aiohttp

async def get_image(name: str, session):
    url = f"""https://terraria.wiki.gg/api.php?action=parse&format=json&maxlag=5&text=%7B%7Bfilepath%3A{name.replace(" ","_")}.png%7D%7D&prop=properties"""
    async with session.get(url) as response:
        while True:
            try:
                #print(response)
                content = await response.json()

                return content["parse"]["properties"][0]["*"]
            except aiohttp.ContentTypeError:
                return None

with open("static/item_data_new.json", "r") as f:
    items = json.load(f)

async def main():
    
    async with aiohttp.ClientSession() as session:
        try:
            for id, item in items.items():
                if "name" in item.keys() and "image" not in item.keys():
                    image = await get_image(item["name"], session)
                    #await asyncio.sleep(0.1)
                    print(image)
                    if image:
                        items[id]["image"] = image
        except KeyboardInterrupt:
            pass
    with open("static/item_data_new.json", "w") as f:
        f.write(json.dumps(items, indent=4))
asyncio.run(main())