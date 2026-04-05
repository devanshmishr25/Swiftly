const express = require('express');
const router = express.Router();
const { getServices, createService } = require('../controllers/serviceController');

router.get('/', getServices);
router.post('/', createService);

module.exports = router;
