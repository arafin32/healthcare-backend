const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.send('health metrics'));

module.exports = router;
