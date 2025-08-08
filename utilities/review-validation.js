const { body, validationResult } = require("express-validator");
const reviewModel = require("../models/review-model");
const Util = require("./index"); 

const validate = {};

/* **********************************
 * Review Validation Rules
 * ********************************* */
validate.reviewRules = () => {
  return [
    body("review_text")
      .trim()
      .not().isEmpty().withMessage("Provide review text of at least 10 characters")
      .isLength({ min: 10 })
      .withMessage("Review must be at least 10 characters long"),
    
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
    let nav = await Util.getNav(); 
    const errorMessages = errors.array().map(err => err.msg);
    
    // For update requests
    if (req.body.review_id) {
      try {
        const review = await reviewModel.getReviewById(req.body.review_id);
        return res.render("review/edit-review", {
          title: "Edit Review",
          nav,
          errors: errorMessages,
          review_id: review.review_id,
          review_text: review.review_text
        });
      } catch (error) {
        req.flash("error", "Error processing review");
        return res.redirect("/account/");
      }
    }
    
    // For new reviews
    if (req.body.inv_id) {
      req.flash("error", errorMessages.join(", "));
      return res.redirect(`/inv/detail/${req.body.inv_id}`);
    }
    
    // Fallback
    return res.redirect("/account/");
  }
  next();
};

module.exports = validate;