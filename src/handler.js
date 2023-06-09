/* eslint-disable new-cap */
/* eslint-disable no-var */
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const AccessToken = require('twilio').jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

const nameGenerator = require('../name_generator');

var identity;

// {
//   "accountSid": "ACb03fed2316821f6bedddc5b11001e8d7",
//   "authToken": "6fd8829d5ebb1afe4faf5574b9e28d7c",
//   "twimlAppSid": "AP3f9df155faea290e7d22d6be8106eb69 ",
//   "callerId": "+13613227906",
//   "apiSid": "SKc7fde85dc56e5a186c380b1977e5c7e4",
//   "apiSecret": "2HJBqodm15ClDEQbjrhomuV34NQ20QBq "
// }


exports.tokenGenerator = function tokenGenerator() {
  identity = nameGenerator();

  const accessToken = new AccessToken(
      'ACb03fed2316821f6bedddc5b11001e8d7',
      'SKc7fde85dc56e5a186c380b1977e5c7e4',
      '2HJBqodm15ClDEQbjrhomuV34NQ20QBq'
  );
  accessToken.identity = identity;
  const grant = new VoiceGrant({
    outgoingApplicationSid: 'AP3f9df155faea290e7d22d6be8106eb69',
    incomingAllow: true,
  });
  accessToken.addGrant(grant);

  return {
    identity: identity,
    token: accessToken.toJwt(),
  };
};

exports.voiceResponse = function voiceResponse(requestBody) {
  const toNumberOrClientName = requestBody.To;
  const callerId = '+13613227906';
  const record = 'record-from-answer-dual';
  const twiml = new VoiceResponse();
  const start = twiml.start();
  start.stream({
    url: 'wss://34fe-2401-4900-5500-8abb-bca7-4307-27c3-d2b9.in.ngrok.io/stream',
  });
  twiml.append(start);
  if (toNumberOrClientName == callerId) {
    const dial = twiml.dial({record});
    dial.client(identity);
  } else if (requestBody.To) {
    const dial = twiml.dial(dial, callerId);
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
