//Queries the ID of the selected tab, and then executes the getHighlighted function followed by the callback to getDefinition.
chrome.tabs.query(
  { 
    currentWindow: true, active: true 
  },

  function (tabArray) 
  { 
    var tabId = tabArray[0].id;

    chrome.scripting.executeScript(
      {
        target: {tabId},
        func: getHighlighted,
      },
      (res) => {
        getDefinition(res[0].result);
      });
  }
);

//Retrieves the highlighted text that the user has on the screen.
function getHighlighted() 
{
  var selected = window.getSelection();
  if(selected != null && selected != 'undefined')
  {
    selected = selected.toString();
  }
  else
  {
    selected = "No Result Found";
  }
  return selected;
}

//Calls the Wordnik API to retrieve the definition and related content of the word passed from the getHighlighted function.
function getDefinition(highlighted)
{
  var APIurl = "http://api.wordnik.com:80/v4/word.json/";
  var APISettings = "/definitions?limit=200&includeRelated=true&useCanonical=false&includeTags=false&api_key=";
  var APIKey = "e4906f30d12a264c87b33d67db55b33fe87e268b94a52e08f";
  var apiCall = APIurl + highlighted + APISettings + APIKey;

  fetch(apiCall).then(function(res)
  {
    res.json().then(function(data)
    {
      presentDefinition(data);
    });
  });
}

//Parses the data recieved from getDefinition and presents it to the user on the popup.html page.
function presentDefinition(definition){
  var word, def, partOfSpeech, exampleUse, secondaryMeaning, outputText = "", location;

  if(definition[0].hasOwnProperty("text"))
  {
    location = 0;
    
  }
  else if(definition[1].hasOwnProperty("text"))
  {
    location = 1;
  }


  if(definition[location].hasOwnProperty("word"))
  {
    word = definition[location]["word"];
    outputText += "<p>Word: <span>" + word + "</span></p>";
  }

  if(definition[location].hasOwnProperty("partOfSpeech"))
  {
    partOfSpeech = definition[location]["partOfSpeech"];
    outputText += "<p>Part of Speech: <span>" + partOfSpeech + "</span></p>";
  }

  if(definition[location].hasOwnProperty("text"))
  {
    def = definition[location]["text"];
    outputText += "<p>Definition: <span>" + def + "</span></p>";
  }

  if(definition[location].hasOwnProperty("exampleUses") && 
    Object.keys(definition[location]["exampleUses"]).length != 0)
  {
    if(definition[location].exampleUses[location].hasOwnProperty("text"))
    {
      exampleUse = definition[location].exampleUses[location]["text"];
      outputText += "<p>Example Usage: <span>'" + exampleUse + "'</span></p>";
    }
  }

  if(Object.keys(definition).length >= 2)
  {
    if(definition[location + 1].hasOwnProperty("text"))
    {
      secondaryMeaning = definition[location + 1]["text"];
      outputText += "<p>Secondary Meanings: <span>" + secondaryMeaning + "</span></p>";
    }
  }

  if(definition[location].hasOwnProperty("relatedWords") 
    && Object.keys(definition[location]["relatedWords"]).length != 0)
  {
    
    if(definition[location].relatedWords[location].hasOwnProperty("words"))
    {
      exampleUse = definition[location].relatedWords[location]["words"];
      outputText += "<p>Related Words: <span>'" + exampleUse + "'</span></p>";
    }
  }

  document.getElementById("output").innerHTML = outputText;
}
