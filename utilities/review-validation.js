const { body, validationResult } = require("express-validator");

const validate = {};

/* **********************************
 * Review Validation Rules
 * ********************************* */
validate.reviewRules = () => {
  return [
    body("review_text")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Review must be at least 10 characters long")
      .escape(), 
    
    body("review_id")
      .optional()
      .isInt().withMessage("Invalid review ID")
  ];
};

/* **********************************
 * Check Review Data
 * ********************************* */
validate.checkReviewData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0].msg;
    
    if (req.body.review_id) {
      req.flash("error", firstError); 
      return res.redirect(`/review/edit/${req.body.review_id}`);
    }
    
    if (req.body.inv_id) {
      req.flash("error", firstError); 
      return res.redirect(`/inv/detail/${req.body.inv_id}`);
    }
  }
  next();
};


module.exports = validate;