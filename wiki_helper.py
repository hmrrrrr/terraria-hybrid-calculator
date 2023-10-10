import requests as re
import json
import asyncio
import aiohttp

async def get_image(name: str, session):
    url = f"""https://terraria.wiki.gg/api.php?action=parse&format=json&maxlag=5&text=%7B%7Bfilepath%3A{name.replace(" ","_")}.png%7D%7D&prop=properties"""
    async with session.get(url) as response:
        content = await response.json()

        return content["parse"]["properties"][0]["*"]

with open("item_data_new.json", "r") as f:
    items = json.load(f)

async def main():
    
    async with aiohttp.ClientSession() as session:
        for id, item in items.items():
            if "name" in item.keys():
                image = await get_image(item["name"], session)
                print(image)

asyncio.run(main())