const reviewModel = require("../models/review-model");
const utilities = require("../utilities");

/* ***************************
 *  Add new review
 * ************************** */
async function addReview(req, res) {
  const { review_text, inv_id } = req.body;
  const account_id = res.locals.accountData.account_id;
  
  try {
   
    if (!review_text || review_text.trim().length < 10) {
      req.flash("error", "Review must be at least 10 characters long");
      return res.redirect(`/inv/detail/${inv_id}`);
    }

    await reviewModel.addReview(review_text.trim(), inv_id, account_id);
    req.flash("notice", "Review added successfully!");
    res.redirect(`/inv/detail/${inv_id}`);
  } catch (error) {
    console.error("Error adding review:", error);
    req.flash("error", "Failed to add review. Please try again.");
    res.redirect(`/inv/detail/${inv_id}`);
  }
}

/* ***************************
 *  Deliver review edit view
 * ************************** */
async function buildEditReview(req, res, next) {
  const review_id = req.params.review_id;
  let nav = await utilities.getNav();
  
  try {
    const review = await reviewModel.getReviewById(review_id);
    
    // Verify ownership
    if (review.account_id !== res.locals.accountData.account_id) {
      req.flash("error", "You can only edit your own reviews");
      return res.redirect("/account/");
    }
    
    res.render("review/edit-review", {
      title: "Edit Review",
      nav,
      errors: null,
      review_id: review.review_id,
      review_text: review.review_text,
      inv_id: review.inv_id
    });
  } catch (error) {
    req.flash("error", "Review not found");
    res.redirect("/account/");
  }
}


/* ***************************
 *  Update Review
 * ************************** */
async function updateReview(req, res) {
  const { review_id, review_text } = req.body;
  const account_id = res.locals.accountData.account_id;

  try {
    // 1. Verify review exists and belongs to user (single check)
    const review = await reviewModel.getReviewById(review_id);
    if (!review) {
      req.flash("error", "Review not found");
      return res.redirect("/account/");
    }
    
    if (review.account_id !== account_id) {
      req.flash("error", "You can only edit your own reviews");
      return res.redirect("/account/");
    }

    // 2. Perform update
    const updateResult = await reviewModel.updateReview(review_id, review_text);
    
    if (!updateResult) {
      throw new Error("Database update failed");
    }

    // 3. Success - Ensure session is saved before redirect
    req.session.save(() => {
      req.flash("success", "Review updated successfully!");
      res.redirect("/account/");
    });

  } catch (error) {
    console.error("Update error:", error);
    
    // Handle different error cases
    if (error.message.includes("Database")) {
      req.flash("error", "Database error occurred");
      return res.redirect("/account/");
    }
    
    // Return to edit form with errors
    const nav = await utilities.getNav();
    return res.render("review/edit-review", {
      title: "Edit Review",
      nav,
      errors: [{ msg: error.message }],
      review_id,
      review_text
    });
  }
}

/* ***************************
 *  Deliver delete confirmation view
 * ************************** */
async function buildDeleteReview(req, res, next) {
  try {
    const review_id = parseInt(req.params.review_id);
    
    // Validate review ID
    if (isNaN(review_id)) {
      req.flash("error", "Invalid review ID");
      return res.redirect("/account/");
    }

    let nav = await utilities.getNav();
    const review = await reviewModel.getReviewById(review_id);
    
    // Check if review exists
    if (!review) {
      req.flash("error", "Review not found");
      return res.redirect("/account/");
    }
    
    // Verify review ownership
    if (review.account_id !== res.locals.accountData.account_id) {
      req.flash("error", "You can only delete your own reviews");
      return res.redirect("/account/");
    }
    
    // Render delete confirmation view
    res.render("review/delete-review", {
      title: "Delete Review",
      nav,
      errors: null,
      review_id: review.review_id,
      review_text: review.review_text,
      review_date: review.review_date,
      inv_id: review.inv_id,
      inv_make: review.inv_make,
      inv_model: review.inv_model,
      inv_year: review.inv_year,
      account_id: review.account_id
    });
  } catch (error) {
    req.flash("error", "Error loading review");
    res.redirect("/account/");
  }
}

/* ***************************
 *  Process Review Deletion
 * ************************** */
async function deleteReview(req, res) {
  try {
    const review_id = parseInt(req.body.review_id);
    
    // Validate review ID
    if (isNaN(review_id)) {
      req.flash("error", "Invalid review ID");
      return res.redirect("/account/");
    }

    const account_id = res.locals.accountData.account_id;
    const review = await reviewModel.getReviewById(review_id);
    
    // Check review exists and belongs to user
    if (!review) {
      req.flash("error", "Review not found");
      return res.redirect("/account/");
    }
    
    if (review.account_id !== account_id) {
      req.flash("error", "You can only delete your own reviews");
      return res.redirect("/account/");
    }

    // Delete review from database
    await reviewModel.deleteReview(review_id);
    req.flash("success", "Review deleted successfully!");
    res.redirect("/account/");
  } catch (error) {
    req.flash("error", "Error deleting review");
    res.redirect("/account/");
  }
}

module.exports = {
  addReview,
  buildEditReview,
  updateReview,
  buildDeleteReview,
  deleteReview
};