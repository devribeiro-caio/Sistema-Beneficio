import mongoose from 'mongoose';

const moneyBenefit = new mongoose.Schema({
  value: { type: Number, min: 0, default: 0 },
  status: { type: String, enum: ['Sim', 'Não'], default: 'Não' }
}, { _id: false });

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  benefits: {
    va: { type: moneyBenefit, default: () => ({}) },
    vr: { type: moneyBenefit, default: () => ({}) },
    cesta: { type: String, enum: ['Sim', 'Não', '45+45'], default: 'Não' }
  }
}, { timestamps: true });

employeeSchema.index({ name: 'text', role: 'text' });
export default mongoose.model('Employee', employeeSchema);
