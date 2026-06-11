const express = require('express');
const router = express.Router();
const salaryCtrl = require('../controllers/salary.controller');

router.get('/components', salaryCtrl.getComponents);
router.post('/components', salaryCtrl.createComponent); 
router.put('/components/toggle/:id', salaryCtrl.toggleComponentStatus);
router.delete('/components/:id', salaryCtrl.deleteComponent);
router.put('/components/:id', salaryCtrl.updateComponent); //TE

module.exports = router;