import express from "express";
import axios, { all } from "axios";
import bodyParser from "body-parser";
import { name } from "ejs";

const app = express();
const port = 3000;
const totalCharacters = 2134;

app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: true }));

async function findCharactersWithSubstring(queryString) {
    const baseUrl = "https://anapioficeandfire.com/api/characters";
    const pageSize = 100; // Fetch 100 characters per page
    let page = 1;
    const matchingNames = [];

    while (true) {
        try {
            // Fetch characters from the current page
            const response = await axios.get(baseUrl, {
                params: { page, pageSize },
            });

            const characters = response.data;

            // If no more characters are returned, break the loop
            if (characters.length === 0) {
                break;
            }

            // Collect names of characters matching the query string
            const filteredNames = characters
                .filter(character => character.name && character.name.toLowerCase().includes(queryString.toLowerCase()))
                .map(character => character.name);

            matchingNames.push(...filteredNames);

            page++; // Go to the next page
        } catch (error) {
            console.error("Error fetching characters:", error.message);
            break;
        }
    }

    return matchingNames;
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

app.get("/", (req, res) => {
    res.render("index.ejs");
  });
  
app.get("/random", async (req, res) => {
    let rngCharIndex = Math.floor(1+(Math.random()*totalCharacters));
    try {
        const result = await axios.get(`https://anapioficeandfire.com/api/characters/${rngCharIndex}`);
        console.log(result.data)
        if (result.data.allegiances.length > 0){
            for (let i=0;i<result.data.allegiances.length;i++){
                let houseURL = result.data.allegiances[i];
                console.log(houseURL)
                let houseData = await axios.get(houseURL);
                result.data.allegiances[i] = houseData.data.name;
            }
        }
        res.render("character.ejs", result.data)
      } catch (error) {
        console.log("Error", error.message)
      }
})

app.post("/search", async (req, res) => {

    try {
        const results = await findCharactersWithSubstring(req.body.name);

        if (results.length > 0) {
            console.log(`Found ${results.length} characters:`);
            console.log(results)
            results.forEach(name => console.log(`- ${name}`));
            res.render("index.ejs", {listOfMatches: results})
        } else {
            res.render("index.ejs", {listOfMatches: []})
            console.log("No characters found with that substring.");
        }
    } catch (error) {
        console.error("An error occurred:", error.message);
    }
})

app.get('/byName', async(req,res)=>{
    try {
        console.log(req.query.name)
        let nameToSearch = encodeURIComponent(req.query.name);
        console.log(nameToSearch)
        const result = await axios.get(`https://anapioficeandfire.com/api/characters?name=${nameToSearch}`);
        console.log(result.data[0])
        if (result.data[0].allegiances.length > 0){
            for (let i=0;i<result.data[0].allegiances.length;i++){
                let houseURL = result.data[0].allegiances[i];
                console.log(houseURL)
                let houseData = await axios.get(houseURL);
                result.data[0].allegiances[i] = ' ' + houseData.data.name + ' ';
            }
        }
        res.render("character.ejs", result.data[0])
      } catch (error) {
        console.log("Error" )
      }
})


