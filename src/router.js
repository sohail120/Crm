/* eslint-disable no-unused-vars */
const Router = require('express').Router;
const { handleRecommendation } = require('./handleRecommendationAI');
const { tokenGenerator, voiceResponse } = require('./handler');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const twilio = require('twilio');

const router = new Router();
const fakeDataTrigger = require('./fakeDataTrigger');
const TWILIO_ACCOUNT_SID = 'ACb03fed2316821f6bedddc5b11001e8d7';
const TWILIO_TWIML_APP_SID = 'AP68e5d7ec6b7bdb2895f771ac450bc7b0';
const TWILIO_CALLER_ID = '+15418713044';
const TWILIO_API_KEY = 'SKc7fde85dc56e5a186c380b1977e5c7e4';
const TWILIO_API_SECRET = '2HJBqodm15ClDEQbjrhomuV34NQ20QBq';

const accountSid = 'ACb03fed2316821f6bedddc5b11001e8d7';
const authToken = '32b8fc3ba4471927b1b89f408c191269';
const client = twilio(accountSid, authToken);
let allParticipants = [];
let conferencesID = '';
router.get('/token', (req, res) => {
  res.send(tokenGenerator());
});

router.post('/voice', async (req, res) => {
  const twiml = new VoiceResponse();
  const dial = twiml.dial();
  const start = twiml.start();
  await dial.conference(
    {
      statusCallbackEvent: 'start end join leave mute hold',
      statusCallback: 'YOUR_STATUS_CALLBACK_URL',
      endConferenceOnExit: true,
    },
    'MyConference'
  );
  // 917558437726
  const numberArray = ['917558227425'];
  try {
    numberArray.map(async (phoneNumber) => {
      const participant = await client
        .conferences('MyConference')
        .participants.create({
          to: phoneNumber,
          from: '+15418713044',
          statusCallback:
            'https://9c0b-2401-4900-57c3-bda4-1ceb-d566-63d6-c758.ngrok-free.app/events',
          statusCallbackEvent: 'answered',
        });
      conferencesID = participant?.conferenceSid;
      allParticipants.push(participant.callSid);
    });
    const url=`wss://${req.headers.host}/stream`;
    console.log(url)

    start.stream({
      // url: 'wss://8871-15-204-57-230.ngrok-free.app/stream',
      url: `wss://${req.headers.host}/stream`,
      // track: 'inbound_track',
    });
    res.set('Content-Type', 'text/xml');
    res.send(twiml.toString());
  } catch (error) {
    console.error(error);
    res.status(500).send('Error sending invitations');
  }
});

router.post('/events', async (req, res) => {
  console.log('res', req.body.CallSid, allParticipants);
  console.log('req.body', conferencesID);
  allParticipants?.map(async (i) => {
    if (i != req.body.CallSid) {
      const participant = await client
        .conferences(conferencesID)
        .participants(i)
        .remove();
    }
    return '';
  });
});

module.exports = router;
