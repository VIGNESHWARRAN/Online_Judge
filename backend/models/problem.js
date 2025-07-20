import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  description:  { type: String, required: true },
  score:   { type: Number, required: true },
  codeBase:     { type: String, required: true },
  testcase:     { type: String, required: true},
  constraintLimit: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model('Problem', problemSchema);
