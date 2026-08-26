const express = require('express');
const router = express.Router();
const { simplifyText } = require('../controllers/simplifyController');

router.post('/simplify', simplifyText);

module.exports = router;