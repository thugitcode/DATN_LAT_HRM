const express = require('express');
const router = express.Router();
const tkCtrl = require('../controllers/timekeeping.controller');

// --- 1. Cấu hình chu kỳ công tổng quát ---
router.get('/config', tkCtrl.getConfig);
router.put('/config', tkCtrl.updateConfig);

// --- 2. Danh mục mạng WiFi văn phòng ---
router.get('/wifis', tkCtrl.getWifis);
router.post('/wifis', tkCtrl.createWifi);
router.delete('/wifis/:id', tkCtrl.deleteWifi);
router.put('/wifis/toggle/:id', tkCtrl.toggleWifiStatus);

// --- 3. Danh mục vùng định vị GPS ---
router.get('/gps', tkCtrl.getGps);
router.post('/gps', tkCtrl.createGps);
router.delete('/gps/:id', tkCtrl.deleteGps);
router.put('/gps/toggle/:id', tkCtrl.toggleGpsStatus);

// --- 4. Danh mục máy chấm công vân tay ---
router.get('/machines', tkCtrl.getMachines);
router.post('/machines', tkCtrl.createMachine);
router.delete('/machines/:id', tkCtrl.deleteMachine);
router.put('/machines/toggle/:id', tkCtrl.toggleMachineStatus);

module.exports = router;