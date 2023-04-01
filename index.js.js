const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());


const handleRecommendation=(triggers,transcription)=>{
    const recommendationScore=triggers?.map((i)=>{
        let score=0;
        const result= i?.tags.map((item)=>{
                   const result=transcription.includes(item)
                   score=result?score+1:score+0
        }) 
        return score
    })
    if (recommendationScore.length === 0) {
        return -1;
    }

    var max = recommendationScore[0];
    var maxIndex = 0;

    for (var i = 1; i < recommendationScore.length; i++) {
        if (recommendationScore[i] > max) {
            maxIndex = i;
            max = recommendationScore[i];
        }
    }

    return triggers[maxIndex].recommendations
}

app.post('/chat-assistant', (req, res) => {
  const { triggers,transcription } = req.body;
      res.send(handleRecommendation(triggers,transcription));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});




// sample data 
// {
//     "triggers":[{"tags":["hello","by","okay"],"recommendations":["okay","bly","not"]},{"tags":["price","charges","policy","by"],"recommendations":["1000","3000","600"]},{"tags":[""],"recommendations":["no recommoodations"]}],
//     "transcription":"hello mjgligfly policy price"
// }
