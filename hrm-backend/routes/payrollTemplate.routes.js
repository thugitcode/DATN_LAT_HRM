const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/payrollTemplate.controller');

router.get('/', ctrl.getTemplates);
router.get('/:id', ctrl.getTemplateDetail);
router.post('/', ctrl.createTemplate);
router.put('/:id', ctrl.updateTemplate);
router.put('/toggle/:id', ctrl.toggleStatus);
router.delete('/:id', ctrl.deleteTemplate);

module.exports = router;