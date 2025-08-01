const utilities = require('../utilities')
const accountModel = require('../models/account-model')
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  ) 

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      
      const payload = {
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname, 
      account_email: accountData.account_email,
      account_type: accountData.account_type
    };
    
    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });
    res.cookie("jwt", token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV !== 'development',
      maxAge: 3600 * 1000 
    });
    return res.redirect("/account/");
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
* Deliver account management view
* *************************************** */
async function buildManagement(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/account-management", {
    title: "Account Management",
    nav,
    errors: null,
    loggedin: res.locals.loggedin,       
    accountData: res.locals.accountData
  })
}

/* ****************************************
 *  Process logout request
 * ************************************ */
async function accountLogout(req, res) {
  res.clearCookie("jwt");
  req.flash("success", "You have been logged out.");
  res.redirect("/");
}

/* ****************************************
*  Deliver account update view (Task 4)
* *************************************** */
async function buildUpdate(req, res, next) {
  const accountId = req.params.id;
  const accountData = await accountModel.getAccountById(accountId);
  let nav = await utilities.getNav();
  res.render("account/update", {
    title: "Edit Account",
    nav,
    errors: null,
    account: accountData
  });
}

/* ****************************************
*  Process Account Update 
* *************************************** */
async function accountUpdate(req, res) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body;
  
  try {
    await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    );
  
    const updatedAccount = await accountModel.getAccountById(account_id);
    if (!updatedAccount) throw new Error("Account not found");

    const payload = {
      account_id: updatedAccount.account_id,
      account_firstname: updatedAccount.account_firstname,
      account_lastname: updatedAccount.account_lastname,
      account_email: updatedAccount.account_email,
      account_type: updatedAccount.account_type 
    };

    const newToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { 
      expiresIn: 3600 * 1000 
    });

    res.cookie("jwt", newToken, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600 * 1000, 
    });

    req.flash("success", "Account updated successfully!");
    res.redirect("/account/");

  } catch (error) {
    console.error("Update error:", error);
    req.flash("error", `Update failed: ${error.message}`);
    res.redirect(`/account/update/${account_id}`);
  }
}

/* ****************************************
*  Process Account Update 
* *************************************** */
async function accountUpdate(req, res) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body;
  
  try {
    // Update account in database
    await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    );
  
    // Get updated account data
    const updatedAccount = await accountModel.getAccountById(account_id);
    if (!updatedAccount) {
      req.flash("error", "Account not found after update");
      return res.redirect(`/account/update/${account_id}`);
    }

    // Update JWT token
    const payload = {
      account_id: updatedAccount.account_id,
      account_firstname: updatedAccount.account_firstname,
      account_email: updatedAccount.account_email,
      account_type: updatedAccount.account_type 
    };

    const newToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { 
      expiresIn: 3600 * 1000 
    });

    // Set updated cookie
    res.cookie("jwt", newToken, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600 * 1000,
      sameSite: 'strict'
    });

    req.flash("success", "Account updated successfully!");
    res.redirect("/account/");

  } catch (error) {
    console.error("Update error:", error);
    req.flash("error", `Update failed: ${error.message}`);
    res.redirect(`/account/update/${account_id}`);
  }
}

/* ****************************************
*  Process Password Update 
* *************************************** */
async function passwordUpdate(req, res) {
  const { account_id, account_password } = req.body;
  
  try {
    // Additional validation
    if (!account_password) {
      throw new Error("Password is required");
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(account_password, 10);

    // Update in database
    const updateResult = await accountModel.updatePassword(account_id, hashedPassword);
    
    if (!updateResult) {
      throw new Error("Error updating password in database");
    }

    // Success - redirect to account management with message
    req.flash("success", "Password updated successfully!");
    return res.redirect("/account/");

  } catch (error) {
    console.error("Error in passwordUpdate:", error);
    
    // Get data to show the form again
    const account = await accountModel.getAccountById(account_id);
    let nav = await utilities.getNav();
    
    // Render update view with errors
    return res.render("account/update", {
      title: "Edit Account",
      nav,
      errors: [{ msg: error.message }],
      account
    });
  }
}

module.exports = { 
  buildLogin, 
  buildRegister, 
  registerAccount, 
  accountLogin, 
  buildManagement,
  accountLogout,
  buildUpdate,
  accountUpdate,
  passwordUpdate
};
