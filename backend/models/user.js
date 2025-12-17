import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id:       { type: String, required: true, unique: true },
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  type: { type: String, required: true},
  contest: {type: mongoose.Schema.Types.ObjectId, ref: 'contest', default: null },
  currentSessionId: { type: String, default: null }, // Stores the active UUID
  lastActiveAt:     { type: Date, default: null }    // Stores time of last heartbeat
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
