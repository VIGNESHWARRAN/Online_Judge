// contestSchema.js
import mongoose from 'mongoose';

const contestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  problems: [{ type: String }],
  participants: [{type: String}]
}, { timestamps: true });

export default mongoose.model('Contest', contestSchema);
