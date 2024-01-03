import mongoose from "mongoose";

const callSchema = new mongoose.Schema({
  callSid: String, // Unique identifier for the call from Twilio
  from: String, // Caller's number
  to: String, // Destination number
  callStatus: String, // Call status (e.g., completed, no-answer)
  callDuration: Number, // Duration in seconds
  voicemailUrl: String, // URL to the voicemail recording
  timestamp: {
    // Time of the call
    type: Date,
    default: Date.now,
  },
});

export const Call = mongoose.model("Call", callSchema);
