import Company from '../models/Company.js';
import Employee from '../models/Employee.js';

const defaults = [
  { name: 'FORMIS INSTRUMENTOS DE MEDICINA LTDA', shortName: 'Formis', color: '#13a9d2' },
  { name: 'INSTRULABOR LICITAÇÃO LTDA', shortName: 'Instrulabor', color: '#f5b400' }
];

export async function listCompanies(_req, res, next) {
  try {
    if (await Company.countDocuments() === 0) await Company.insertMany(defaults);
    res.json(await Company.find().sort({ shortName: 1 }).lean());
  } catch (error) { next(error); }
}

export async function createCompany(req, res, next) {
  try {
    const { name, shortName, color } = req.body;
    if (!name?.trim() || !shortName?.trim()) return res.status(400).json({ message: 'Informe a razão social e o nome curto.' });
    res.status(201).json(await Company.create({ name, shortName, color }));
  } catch (error) { next(error); }
}

export async function updateCompany(req, res, next) {
  try {
    const { name, shortName, color } = req.body;
    if (!name?.trim() || !shortName?.trim()) return res.status(400).json({ message: 'Informe a razão social e o nome curto.' });
    const company = await Company.findByIdAndUpdate(req.params.id, { name, shortName, color }, { new: true, runValidators: true });
    if (!company) return res.status(404).json({ message: 'Empresa não encontrada.' });
    res.json(company);
  } catch (error) { next(error); }
}

export async function listEmployees(req, res, next) {
  try {
    const filter = {};
    if (req.query.company) filter.company = req.query.company;
    if (req.query.search) filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { role: { $regex: req.query.search, $options: 'i' } }
    ];
    res.json(await Employee.find(filter).populate('company', 'name shortName color').sort({ name: 1 }).lean());
  } catch (error) { next(error); }
}

export async function createEmployee(req, res, next) {
  try {
    const { name, role, company, benefits = {} } = req.body;
    if (!name?.trim() || !role?.trim() || !company) return res.status(400).json({ message: 'Informe nome, cargo e empresa.' });
    const employee = await Employee.create({ name, role, company, benefits });
    await employee.populate('company', 'name shortName color');
    res.status(201).json(employee);
  } catch (error) { next(error); }
}

export async function updateEmployee(req, res, next) {
  try {
    const { name, role, company, benefits } = req.body;
    if (!name?.trim() || !role?.trim() || !company) return res.status(400).json({ message: 'Informe nome, cargo e empresa.' });
    const employee = await Employee.findByIdAndUpdate(req.params.id, { name, role, company, benefits }, { new: true, runValidators: true }).populate('company', 'name shortName color');
    if (!employee) return res.status(404).json({ message: 'Colaborador não encontrado.' });
    res.json(employee);
  } catch (error) { next(error); }
}

export async function deleteEmployee(req, res, next) {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Colaborador não encontrado.' });
    res.status(204).end();
  } catch (error) { next(error); }
}

export async function getSummary(req, res, next) {
  try {
    const filter = req.query.company ? { company: req.query.company } : {};
    const rows = await Employee.find(filter).select('benefits').lean();
    const totals = rows.reduce((acc, row) => {
      const benefits = row.benefits || {};
      if (benefits.va?.status === 'Sim') acc.va += Number(benefits.va.value || 0);
      if (benefits.vr?.status === 'Sim') acc.vr += Number(benefits.vr.value || 0);
      if (benefits.va?.status === 'Sim' || benefits.vr?.status === 'Sim') acc.withMoney++;
      if (benefits.cesta && benefits.cesta !== 'Não') acc.cesta++;
      return acc;
    }, { va: 0, vr: 0, withMoney: 0, cesta: 0 });
    res.json({ employees: rows.length, va: totals.va, vr: totals.vr, total: totals.va + totals.vr, withMoney: totals.withMoney, cesta: totals.cesta });
  } catch (error) { next(error); }
}
