const express = require('express');
const { animals } = require('./data/animals');
const fs = require('fs'); // fs library is required to write the data to animals.json
const path = require('path');

const PORT = process.env.PORT || 3001;
const app = express();
// parse incoming string or array data
app.use(express.urlencoded({extended: true}));
//parse incoming JSON data
app.use(express.json());

// animals.json is the animalsArray
function filterByQuery(query, animalsArray) {
  let personalityTraitsArray = [];
  let filteredResults = animalsArray;
  if (query.personalityTraits) {
    if (typeof query.personalityTraits === 'string') {
      personalityTraitsArray = [query.personalityTraits];
    } else {
      personalityTraitsArray = query.personalityTraits;
    }
    personalityTraitsArray.forEach(trait => {
      filteredResults = filteredResults.filter(
        animal => animal.personalityTraits.indexOf(trait) !== -1
      );
    });
  }
  if (query.diet) {
    filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
  }
  if (query.species) {
    filteredResults = filteredResults.filter(animal => animal.species === query.species);
  }
  if (query.name) {
    filteredResults = filteredResults.filter(animal => animal.name === query.name);
  }
  return filteredResults;
}

function findById(id, animalsArray) {
  const result = animalsArray.filter(animal => animal.id === id)[0];
  return result;
}

function createNewAnimal(body, animalsArray){
  const animal = body; //the body is the variable 'animal'
  animalsArray.push(animal); // push the body to animalsArray within the server.js file. See const fs and path for how it gets to animals.json. Module 11.2.6

  //Here, we're using the fs.writeFileSync() method, which is the synchronous version of fs.writeFile() and doesn't require a callback function. 
  //If we were writing to a much larger data set, the asynchronous version would be better. But because this isn't a large file, it will work for our needs.
  fs.writeFileSync(
    path.join(__dirname, './data/animals.json'),   // joins the value of __dirname with the path to the animals.json file.
    JSON.stringify({animals: animalsArray}, null, 2)
    //JSON.stringify converts the JS animalsArray into JSON data. 
    //Null and 2 keep data formatted. Null means we don't want to edit any existing data. 2 indicates we want ot create white space between our values to make it more readable.
    // This would work without null and 2, but the entire animals.json file would be really hard to read.
  );
  // return finished code to post route for response
  return animal;
}

function validateAnimal(animal) {
  if (!animal.name || typeof animal.name !== 'string') {
    return false; // "if no animal name, or the input is not a string, return false"
  } 
  if (!animal.species || typeof animal.species !== 'string') {
    return false; //"if no animal species, or the input is not a string, return false"
  }
  if (!animal.diet || typeof animal.diet !== 'string') {
    return false;
  }
  if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
    return false;
  }
  return true; //if none of the above happens, return true.
}

app.get('/api/animals', (req, res) => {
  let results = animals;
  if (req.query) {
    results = filterByQuery(req.query, results);
  }
  res.json(results);
});

app.get('/api/animals/:id', (req, res) => {
  const result = findById(req.params.id, animals);
  if (result) {
    res.json(result);
  } else {
    res.send(404);
  }
});

//app.post for making new data to go in an array.
app.post('/api/animals', (req, res) => {
  // req.body is where our incoming content will be
  // set id based on what the next index of the array will be.
  req.body.id = animals.length.toString();

  // if any data in req.body is incorrect, send 400 error back.
  if (!validateAnimal(req.body)) {
    res.status(400).send('The animal is not properly formatted.')
  } else {
    // add animal to json file and animalsArray in this function
    const animal = createNewAnimal(req.body, animals);
    
    res.json(animal);
  }

});


app.listen(PORT, () => {
  console.log(`API server now on port ${PORT}!`);
});
