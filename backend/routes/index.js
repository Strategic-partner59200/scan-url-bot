const { Router } = require('express');
const AppController = require('../controllers/AppController');
const ScanController = require('../controllers/ScanController');

const router = Router();

router.get("/", AppController.test);
router.post('/scan', ScanController.scan);
router.get('/routes', ScanController.getStoredRoutes);
router.post('/storeroutes', ScanController.storeRoutes);
router.post('/chatbot', ScanController.chatbot);
router.post('/reset-routes', ScanController.resetRoutes);

module.exports = router