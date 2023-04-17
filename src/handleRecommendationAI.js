

// eslint-disable-next-line max-len
exports.handleRecommendation=function handleRecommendation(triggers, transcription) {
  const recommendationScore=triggers.map((i)=>{
    let score=0;
    // eslint-disable-next-line no-unused-vars
    const result= i.tags.map((item)=>{
      const result=transcription.includes(item);
      score=result?score+1:score+0;
    });
    return score;
  });
  if (recommendationScore.length === 0) {
    return -1;
  }

  let max = recommendationScore[0];
  let maxIndex = 0;

  for (let i = 1; i < recommendationScore.length; i++) {
    if (recommendationScore[i] > max) {
      maxIndex = i;
      max = recommendationScore[i];
    }
  }

  return triggers[maxIndex].recommendations;
};
