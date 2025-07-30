import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  score: { type: Number, required: true },
  codeBase: { type: String, required: true },
  testcases: [
    {
      input: { type: String },
      output: { type: String, required: true }
    }
  ],
  constraintLimit: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model('Problem', problemSchema);
