import json

# Open the file for reading
with open('raw_item_data/ItemID.cs', 'r') as f:
    # Read the lines of the file
    lines = f.readlines()

# Create an empty dictionary to store the item IDs
item_ids = {}

# Loop through each line of the file
for line in lines:
    # Check if the line contains an item ID definition
    if 'public const short' in line:
        # Split the line into the item ID name and value
        parts = line.split('=')
        name = parts[0].strip().split(' ')[-1]
        value = int(parts[1].strip().rstrip(';'))

        # Add the item ID to the dictionary
        item_ids[value] = name

# Save the item IDs as a JSON file
with open('item_ids_parsed.json', 'w') as f:
    json.dump(item_ids, f)
