/* eslint-disable require-jsdoc */
/* eslint-disable no-var */
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const AccessToken = require('twilio').jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

const nameGenerator = require('../name_generator');
// const config = require('../config');

var identity;
const TWILIO_ACCOUNT_SID = 'ACb03fed2316821f6bedddc5b11001e8d7';
const TWILIO_TWIML_APP_SID = 'AP68e5d7ec6b7bdb2895f771ac450bc7b0';
const TWILIO_CALLER_ID = '+15418713044';
const TWILIO_API_KEY = 'SKc7fde85dc56e5a186c380b1977e5c7e4';
const TWILIO_API_SECRET = '2HJBqodm15ClDEQbjrhomuV34NQ20QBq';

exports.tokenGenerator = function tokenGenerator() {
  identity = nameGenerator();

  const accessToken = new AccessToken(
      TWILIO_ACCOUNT_SID,
      TWILIO_API_KEY,
      TWILIO_API_SECRET
  );
  accessToken.identity = identity;
  const grant = new VoiceGrant({
    outgoingApplicationSid: TWILIO_TWIML_APP_SID,
    incomingAllow: true,
  });
  accessToken.addGrant(grant);

  // Include identity and token in a JSON response
  return {
    identity: identity,
    token: accessToken.toJwt(),
  };
};

exports.voiceResponse = function voiceResponse(requestBody) {
  const toNumberOrClientName = requestBody.To;
  const callerId = TWILIO_CALLER_ID;
  const record = 'record-from-answer-dual';
  const twiml = new VoiceResponse();
  const start = twiml.start();
  if (toNumberOrClientName == callerId) {
    function gather() {
      const gatherNode = twiml.gather({numDigits: 1});
      gatherNode.say('For sales, press 1. For support, press 2.');

      // If the user doesn't enter input, loop
      twiml.redirect('/voice');
    }

    if (requestBody.Digits) {
      switch (requestBody.Digits) {
        case '1':
          twiml.say('You selected sales. Good for you!');

          start.stream({
            url: 'wss://8871-15-204-57-230.ngrok-free.app/stream',
            track: 'inbound_track',
          });
          const dial = twiml.dial({record});
          console.log('connect');
          // This will connect the caller with your Twilio.Device/client
          dial.client(identity);
          // twiml.redirect('/voice');
          console.log(requestBody);
          break;
        case '2':
          twiml.say('You need support. We will help!');
          break;
        default:
          twiml.say('Sorry, I don\'t understand that choice.');
          twiml.pause();
          gather();
          break;
      }
    } else {
      // If no input was sent, use the <Gather> verb to collect user input
      gather();
    }
  } else if (requestBody.To) {
    start.stream({
      url: 'wss://8871-15-204-57-230.ngrok-free.app/stream',
      track: 'outbound_track',
    });

    const dial = twiml.dial({callerId, record});

    // Check if the 'To' parameter is a Phone Number or Client Name
    // in order to use the appropriate TwiML noun
    const attr = isAValidPhoneNumber(toNumberOrClientName) ?
      'number' :
      'client';
    dial[attr]({}, toNumberOrClientName);
  } else {
    twiml.say('Thanks for calling!');
  }

  return twiml.toString();
};

/**
 * Checks if the given value is valid as phone number
 * @param {Number|String} number
 * @return {Boolean}
 */
function isAValidPhoneNumber(number) {
  return /^[\d\+\-\(\) ]+$/.test(number);
}
