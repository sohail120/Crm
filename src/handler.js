/* eslint-disable new-cap */
/* eslint-disable no-var */
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const AccessToken = require('twilio').jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

const nameGenerator = require('../name_generator');

var identity;
// "TwilioAccountDetails": {
//   "AccountSid": "ACdaf30c4e36cad2da736ae7f50eab74ca",
//   "AuthToken": "53feb85fa03b3674e2c653f0a4d47580",
//   "TwimlAppSid": "APa15c2f4762a278513f215c6b0146f4ec",
//   "CallerId": "+13613096182",
//   "ApiSid": "SK604946e323a6c3e0f778c37d55bc4a47",
//   "ApiSecret": "05HMJQEu65hU4h1cyskFqnk5AQvs0XWq"
// }

exports.tokenGenerator = function tokenGenerator() {
  identity = nameGenerator();

  const accessToken = new AccessToken(
      'ACdaf30c4e36cad2da736ae7f50eab74ca',
      'SK604946e323a6c3e0f778c37d55bc4a47',
      '05HMJQEu65hU4h1cyskFqnk5AQvs0XWq'
  );
  accessToken.identity = identity;
  const grant = new VoiceGrant({
    outgoingApplicationSid: 'APa15c2f4762a278513f215c6b0146f4ec',
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
  const callerId = '+13613096182';
  const record = 'record-from-ringing-dual';
  const twiml = new VoiceResponse();
  const start = twiml.start();
  // const record=twiml.record();
  // start.stream(url='wss://https://545e-2401-4900-52b8-7f33-e07c-c5bb-6a3e-24fd.ngrok-free.app/stream');
  start.stream({
    url: 'wss://34fe-2401-4900-5500-8abb-bca7-4307-27c3-d2b9.in.ngrok.io/stream',
  });
  twiml.append(start);
  // twiml.append(record);

  // If the request to the /voice endpoint is TO your Twilio Number,
  // then it is an incoming call towards your Twilio.Device.
  if (toNumberOrClientName == callerId) {
    const dial = twiml.dial({record});

    // This will connect the caller with your Twilio.Device/client
    dial.client(identity);
  } else if (requestBody.To) {
    // This is an outgoing call

    // set the callerId
    const dial = twiml.dial(dial, callerId);

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
