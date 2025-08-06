const { body, validationResult } = require("express-validator");
const validate = {};

/* ***************************
 * Review Validation Rules
 * ************************** */
validate.reviewRules = () => {
  return [
    body("review_text")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Review must be at least 10 characters long"),
    
    body("inv_id")
      .exists()
      .isInt()
      .withMessage("Invalid inventory item"),
    
    body("account_id")
      .optional()
      .isInt()
      .withMessage("Invalid account")
  ];
};

/* ***************************
 * Check Review Data
 * ************************** */
validate.checkReviewData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    req.flash("error", errors.array());
    return res.redirect(req.get("referer"));
  }
  next();
};

module.exports = validate;