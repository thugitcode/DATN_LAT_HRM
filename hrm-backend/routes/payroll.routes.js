const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/payroll.controller');

router.get('/by-month/status',   ctrl.getStatus);
router.get('/by-month',          ctrl.getByMonth);
router.post('/by-month/calculate', ctrl.calculate);
router.patch('/by-month/lock',     ctrl.lock);
router.patch('/by-month/unlock',   ctrl.unlock);
router.get('/results/:id/detailed', ctrl.getResultDetails);
router.get('/periods',           ctrl.getPeriods);
router.get('/feedback',          ctrl.getFeedback);
router.get('/staff/:id/history', ctrl.getStaffHistory);

// Revenue routes
const revenueCtrl = require('../controllers/revenue.controller');
router.get('/staff-revenue',       revenueCtrl.getAll);
router.get('/staff-revenue/:id',   revenueCtrl.getById);
router.post('/staff-revenue',      revenueCtrl.create);
router.patch('/staff-revenue/:id', revenueCtrl.update);
router.delete('/staff-revenue/:id',revenueCtrl.remove);

// KPI routes
const kpiCtrl = require('../controllers/kpi.controller');
router.get('/staff-kpi',     kpiCtrl.getAll);
router.get('/staff-kpi/:id', kpiCtrl.getById);
router.post('/staff-kpi',    kpiCtrl.create);
router.patch('/staff-kpi/:id', kpiCtrl.update);
router.delete('/staff-kpi/:id', kpiCtrl.remove);

// Other income routes
const otherIncomeCtrl = require('../controllers/other-income.controller');
router.get('/other-income',      otherIncomeCtrl.getAll);
router.get('/other-income/:id',  otherIncomeCtrl.getById);
router.post('/other-income',     otherIncomeCtrl.create);
router.patch('/other-income/:id', otherIncomeCtrl.update);
router.delete('/other-income/:id', otherIncomeCtrl.remove);

// Summary finalize routes
router.get('/by-month/summary',        require('../controllers/payroll.controller').getSummary);
router.get('/by-month/latest-summary', require('../controllers/payroll.controller').getSummaryLatest);

module.exports = router;