// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build car detail view by inventory id
router.get("/detail/:invId", invController.buildByInvId)

// Route to test error handling
router.get("/error/:errParam", invController.linkError)

module.exports = router;