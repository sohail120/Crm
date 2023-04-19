/* eslint-disable no-unused-vars */
const Router = require('express').Router;
const {handleRecommendation} = require('./handleRecommendationAI');
const {tokenGenerator, voiceResponse} = require('./handler');

const router = new Router();
const fakeDataTrigger = require('./fakeDataTrigger');


router.get('/token', (req, res) => {
  res.send(tokenGenerator());
});

router.post('/voice', (req, res) => {
  res.set('Content-Type', 'text/xml');
  res.send(voiceResponse(req.body));
});

router.post('/chat-assistant', (req, res) => {
  const {triggers, transcription} = req.body;

  res.send(handleRecommendation(fakeDataTrigger.triggers, transcription));
});


module.exports = router;
