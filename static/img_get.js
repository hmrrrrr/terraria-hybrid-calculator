const session = axios.create();
const apiUrl = 'https://terraria.wiki.gg/api.php';
console.log('Initialized session and apiUrl');

async function login() {
    const params0 = {
        action: 'query',
        meta: 'tokens',
        type: 'login',
        format: 'json'
    };
    console.log('About to make login token request');
    const response0 = await session.get(apiUrl, { params: params0 });
    const loginToken = response0.data.query.tokens.logintoken;
    console.log(response0.data)
    const params1 = {
        action: 'login',
        lgname: 'Starblock@starblock_bot',
        lgpassword: '16h7dhcspk4eib48mkc7jaaopg9sgjub',
        lgtoken: loginToken,
        format: 'json'
    };
    console.log('About to make login request');
    const response1 = await session.post(apiUrl, null, { params: params1 });
    console.log(response1);
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

async function get_image(name) {
    const text = `%7B%7Bfilepath%3A${name.replace(" ", "_")}.png%7D%7D`
    const params3 = {
        action: 'parse',
        format: 'json',
        text: text,
        prop: 'properties'
    };
    console.log(name);
    const response3 = await session.get(apiUrl, { params: params3 });
    console.log(response3.data);

}
async function fetchImages() {

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

async function main() {
    try {
        await login();
        await fetchImages();
    } catch (error) {
        console.error(error);
    }
}

main();
