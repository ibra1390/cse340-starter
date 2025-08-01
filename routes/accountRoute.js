// Needed Resources 
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const regValidate = require("../utilities/account-validation")

// Route to deliver login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route to deliver registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

//Process registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Route to process logout
router.get(
  "/logout", 
  utilities.checkLogin, 
  utilities.handleErrors(accountController.accountLogout)
);

// Route to account management view
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildManagement))

// Route to deliver account update view
router.get("/update/:id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdate)
);

module.exports = router;