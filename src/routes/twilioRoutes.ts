import express from "express";
import * as twilioController from "../controllers/twilioController";

const router = express.Router();

router.post("/incoming-call", twilioController.incomingCall);
router.post("/handle-key", twilioController.handleKey);
router.post("/recording-done", twilioController.recordingDone);
router.post('/call-completed', twilioController.callCompleted);

export default router;
