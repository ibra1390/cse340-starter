const express = require("express");
const router = new express.Router();
const reviewController = require("../controllers/reviewController");
const utilities = require("../utilities");
const validate = require("../utilities/review-validation");

// Add review
router.post(
  "/add",
  utilities.checkLogin,
  validate.reviewRules(),
  validate.checkReviewData,
  utilities.handleErrors(reviewController.addReview)
);

// Edit review view
router.get(
  "/edit/:review_id",
  utilities.checkLogin,
  utilities.handleErrors(reviewController.buildEditReview)
);

// Update review
router.post(
  "/update",
  utilities.checkLogin,
  validate.reviewRules(),
  validate.checkReviewData,
  utilities.handleErrors(reviewController.updateReview)
);

// Deliver delete view
router.get(
  "/delete/:review_id",
  utilities.checkLogin,
  utilities.handleErrors(reviewController.buildDeleteReview)
);

// Delete review
router.post(
  "/delete",
  utilities.checkLogin,
  utilities.handleErrors(reviewController.deleteReview)
);

module.exports = router;