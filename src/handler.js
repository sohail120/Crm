/* eslint-disable new-cap */
/* eslint-disable no-var */
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const AccessToken = require('twilio').jwt.AccessToken;
const Start =require('twilio').twiml.Start;
const VoiceGrant = AccessToken.VoiceGrant;

const nameGenerator = require('../name_generator');

var identity;

exports.tokenGenerator = function tokenGenerator() {
  identity = nameGenerator();

  const accessToken = new AccessToken(
      'ACa09a3e5de56cf2227b7ab5c01ad8c595',
      'SKa152bbed29e8c927af7562cc6ba04394',
      'UARA7vwAJ10JrNeNHuRAP4SCL1gbHjtF'
  );
  accessToken.identity = identity;
  const grant = new VoiceGrant({
    outgoingApplicationSid: 'APb3dd49e974201be95fdc6601ae803cb8',
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
  const callerId = '+12765829122';
  const twiml = new VoiceResponse();
  const start = Start();
  start.stream(url='wss://https://545e-2401-4900-52b8-7f33-e07c-c5bb-6a3e-24fd.ngrok-free.app/stream');
  twiml.append(start);
  // If the request to the /voice endpoint is TO your Twilio Number,
  // then it is an incoming call towards your Twilio.Device.
  if (toNumberOrClientName == callerId) {
    const dial = twiml.dial();

    // This will connect the caller with your Twilio.Device/client
    dial.client(identity);
  } else if (requestBody.To) {
    // This is an outgoing call

    // set the callerId
    const dial = twiml.dial({callerId});

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
