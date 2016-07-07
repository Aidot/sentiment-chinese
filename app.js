var sentiment = require('./lib/index');

var express = require('express');
var app = express();
var bodyParser = require("body-parser");

// respond with "hello world" when a GET request is made to the homepage
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Sentiment Analysis
app.post('/json/', function(req, res) {
  //console.log(req.body);
  var phrase = req.body.text ? req.body.text : "我今天很开心！";
  phrase = phrase.replace(/[^\u4e00-\u9fa5]/g,'@');
  phrase = phrase.replace(/@+/g,' ');
  res.status(200).json(analyzes(phrase));
});

//Emotionnal Train
app.post('/train/', function(req, res) {
  console.log(req.body);
  var Parse = require('parse/node');

  Parse.initialize("appid_001", "appkey_001");
  Parse.serverURL = 'http://127.0.0.1:1337/parse';


  var phrase = req.body.phrase ? req.body.phrase : "我今天很开心！";

  var TrainObj = Parse.Object.extend("Train");
  var Train = new TrainObj();
  var trainData = {
    phrase: req.body.phrase,
    emotion: req.body.emotion,
    strength: req.body.strength,
    polar: req.body.polar,
    date: new Date()
  };

  Train.save(trainData, {
    success: function(train) {
      console.log('Saved...');
      res.status(200).json('{message:"ok"}');
    },
    error: function(train, error) {
      // The save failed.
      // error is a Parse.Error with an error code and message.
    }
  });

});

app.listen(5250);

console.log('Host Port :5250');

function analyzes(str){
    str = str.split(' ');
    var anArr = [];
    for(var i = 0;i<str.length;i++){
        var sentence = str[i];
        if(sentence.length>=1){
            anArr.push(sentiment(sentence))
        }
    }
    return anArr;
}
