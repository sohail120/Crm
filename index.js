const express = require("express");
const app = express();
const product = require("./api/product");

app.use(express.json({ extended: false }));

app.use("/api/product", product);

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

app.post('/', (req, res) => {
        res.send("hello");
  });
// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});






const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server is running in port ${PORT}`));