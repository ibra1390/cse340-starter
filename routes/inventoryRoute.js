// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities");
const invValidate = require("../utilities/inventory-validation");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build car detail view by inventory id
router.get("/detail/:invId", invController.buildByInvId)

// Route to test error handling
router.get("/error/:errParam", invController.linkError)

/* ***************************
 *  Assignment 4 
 * ************************** */

// Route to Management View (Task 1)
router.get("/", utilities.handleErrors(invController.buildManagementView));

// Add Classification View (Task 2)
router.get("/add-classification", utilities.handleErrors(invController.newClassificationView));

// Process Classification (Task 2)
router.post("/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

// Add Inventory View (Task 3)
router.get("/add-inventory", utilities.handleErrors(invController.newInventoryView)
);

// Process Inventory (Task 3)
router.post("/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

// Route to display inventory in management view
router.get("/getInventory/:classification_id", 
  utilities.handleErrors(invController.getInventoryJSON)
);

// Route to build edit inventory view
router.get("/edit/:invId", 
  utilities.handleErrors(invController.editInventoryView)
);

// Process edit inventory submission
router.post("/update/", 
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);
  


module.exports = router;