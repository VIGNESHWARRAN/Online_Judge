import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  problem:    { type: String, required: true },
  user:       { type: String, required: true },
  username: { type: String, required:true },
  score: {type: Number, require:true},
  result:     { type: String, enum: ['Accepted', 'Wrong Answer', 'Pending', 'Judging'], default: 'Pending' },
  time:       { type: Number },
  memory:     { type: Number }, 
}, { timestamps: { createdAt: 'submittedAt', updatedAt: false } });

export default mongoose.model('Submission', submissionSchema);
