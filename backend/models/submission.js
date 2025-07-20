import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  problem:    { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  result:     { type: String, enum: ['Accepted', 'Wrong Answer', 'Pending', 'Judging'], default: 'Pending' },
  time:       { type: Number },
  memory:     { type: Number }, 
}, { timestamps: { createdAt: 'submittedAt', updatedAt: false } });

export default mongoose.model('Submission', submissionSchema);
