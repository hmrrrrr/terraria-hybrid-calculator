

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


async function get_image(name) {
    const url = `https://terraria.wiki.gg/api.php?action=parse&format=json&maxlag=5&text=%7B%7Bfilepath%3A${name.replace(" ", "_")}.png%7D%7D&prop=properties`;
    const response = await fetch(url, { mode: 'no-cors' });
    const content = await response.json();
    return content.parse.properties[0]["*"];
  }

  async function fetchData() {
    const items = JSON.parse(loadFile('static/item_data_new.json'));

    for (const [id, item] of Object.entries(items)) {
      if (item.name) {
        try {
          console.log(item.name)
          const image = await get_image(item.name);
          console.log(image);
        } catch (error) {
          console.error(error);
        }
      }
    }
  }

  fetchData();