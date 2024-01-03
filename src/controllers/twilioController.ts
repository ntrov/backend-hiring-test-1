import { Request, Response } from "express";
import * as util from "util";
import twilio from "twilio";
import { Call } from "../models/callModel";

const { VoiceResponse } = twilio.twiml;

const YOUR_TWILIO_NUMBER = process.env.TWILIO_NUMBER;
const YOUR_PERSONAL_NUMBER = process.env.PERSONAL_NUMBER;

export const incomingCall = (req: Request, res: Response) => {
  console.log(`Incoming call invoked`);

  const twiml = new VoiceResponse();
  const gather = twiml.gather({ numDigits: 1, action: "/handle-key" });
  gather.say("Welcome! Press 1 to forward your call to Wajahat, or 2 to leave a voicemail.");
  twiml.redirect("/incoming-call");
  res.type("text/xml");
  res.send(twiml.toString());
};

export const handleKey = async (req: Request, res: Response) => {
  console.log(`Handle Key invoked with digit: ${req.body.Digits}`);

  const digit = req.body.Digits;
  const twiml = new VoiceResponse();

  const callData = {
    callSid: req.body.CallSid, // Save the CallSid from Twilio
    from: req.body.From,
    to: YOUR_PERSONAL_NUMBER, // or YOUR_TWILIO_NUMBER based on your logic
    callStatus: req.body.status, // Update this status based on actual call status
    callDuration: 0, // Updated based on actual duration
    // voicemailUrl will be set later if there's a voicemail
  };

  if (digit === "1") {
    twiml.dial({ callerId: YOUR_TWILIO_NUMBER }, YOUR_PERSONAL_NUMBER);
  } else if (digit === "2") {
    twiml.say("Please leave a message after the beep.");
    twiml.record({ recordingStatusCallback: "/recording-done" });
  } else {
    twiml.say("Sorry, I don't understand that choice.");
    twiml.redirect("/incoming-call");
  }

  try {
    const call = await Call.findOne({ callSid: callData.callSid });
    const newCall = new Call(callData);
    if (!call) {
      await newCall.save();
    }
  } catch (error) {
    console.error("Error saving call data:", error);
  }

  res.type("text/xml");
  res.send(twiml.toString());
};

export const recordingDone = async (req: Request, res: Response) => {
  console.log(`Recording completed invoked`);

  const callSid = req.body.CallSid;
  const recordingUrl = req.body.RecordingUrl + ".mp3";

  try {
    // Find the call record by call SID and update the voicemailUrl and callStatus accordingly
    await Call.findOneAndUpdate({ callSid: callSid }, { voicemailUrl: recordingUrl });

    res.status(200).send("Recording saved");
  } catch (error) {
    console.error("Error saving recording:", error);
    res.status(500).send("Error saving recording");
  }
};

export const callCompleted = async (req: Request, res: Response) => {
  console.log(`Call completed invoked`);

  const callSid = req.body.CallSid;

  try {
    const call = await Call.findOne({ callSid: callSid });
    if (call) {
      call.callDuration = req.body.CallDuration;
      call.callStatus = req.body.CallStatus;
      await call.save();
    }

    res.status(200).send("Call completed and saved");
  } catch (error) {
    console.error("Error updating call data:", error);
    res.status(500).send("Error updating call data");
  }
};
