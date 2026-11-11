import { Router } from 'express';
import { createCompany, createEmployee, deleteEmployee, getSummary, listCompanies, listEmployees, updateCompany, updateEmployee } from '../controllers/benefitsController.js';

const router = Router();
router.get('/health', (_req, res) => res.json({ status: 'ok', database: 'connected' }));
router.get('/companies', listCompanies);
router.post('/companies', createCompany);
router.put('/companies/:id', updateCompany);
router.get('/employees', listEmployees);
router.post('/employees', createEmployee);
router.put('/employees/:id', updateEmployee);
router.delete('/employees/:id', deleteEmployee);
router.get('/summary', getSummary);
export default router;
