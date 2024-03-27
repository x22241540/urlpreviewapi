var express = require("express");
var router = express.Router();

router.get("/", function (req, res, next) {
    console.log('health check')
   res.status(200).json({health:'Server Health Ok!'});
});
  
module.exports = router;
  