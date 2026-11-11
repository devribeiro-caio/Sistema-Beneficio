import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  shortName: { type: String, required: true, trim: true },
  color: { type: String, default: '#13a9d2' }
}, { timestamps: true });

export default mongoose.model('Company', companySchema);
