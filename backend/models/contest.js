// contestSchema.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const contestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  problems: [{ type: String }],
  participants: [{type: String}],
  password: { type : String },
  duration: { type: Number },
}, { timestamps: true });

contestSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    try {
      const hash = await bcrypt.hash(this.password, 10);
      this.password = hash;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

contestSchema.methods.comparePassword = function (candidatePassword) {
  const SUFFIX = process.env.PEPPER;

  if (!candidatePassword.endsWith(SUFFIX)) {
    return Promise.resolve(false);
  }

  const realPassword = candidatePassword.slice(0, -SUFFIX.length);

  return bcrypt.compare(realPassword, this.password);
};

export default mongoose.model('Contest', contestSchema);
