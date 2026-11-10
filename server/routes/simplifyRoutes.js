const express = require('express');
const router = express.Router();
const { simplifyText } = require('../controllers/simplifyController');
const { simplifyAll } = require('../controllers/simplifyAllController');

router.post('/simplify', simplifyText);
router.post('/simplify/all', simplifyAll);

module.exports = router;