import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  cookieId: { type: String, required: true, unique: true },
  createdAt: {
    type: Date,
    expires: process.env.SESSION_DURATION_SECONDS,
    default: Date.now,
  },
});
const SessionModel = mongoose.model('Session', sessionSchema);
export default SessionModel;
