import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  submissionId : {type: String, required: true},
  problem:    { type: String, required: true },
  user:       { type: String, required: true },
  contestId: {type: mongoose.Schema.Types.ObjectId, ref: 'contest', default: null },
  username: { type: String, required:true },
  score: {type: Number, required:true},
  result:     { type: String, enum: ['Accepted', 'Wrong Answer', 'Pending', 'Judging'], default: 'Pending' },
  time:       { type: Number },
  memory:     { type: Number }, 
}, { timestamps: { createdAt: 'submittedAt', updatedAt: false } });

export default mongoose.model('Submission', submissionSchema);
