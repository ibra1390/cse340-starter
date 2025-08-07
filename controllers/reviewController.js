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
 *  Delete review
 * ************************** */
async function deleteReview(req, res) {
  const review_id = req.params.review_id;
  const account_id = res.locals.accountData.account_id;
  
  try {
    // Verify the review belongs to the logged-in user
    const review = await reviewModel.getReviewById(review_id);
    if (!review || review.account_id !== account_id) {
      req.flash("error", "You can only delete your own reviews");
      return res.redirect("/account/");
    }

    const deleted = await reviewModel.deleteReview(review_id);
    
    if (deleted) {
      req.flash("success", "Review deleted successfully!");
    } else {
      req.flash("error", "Failed to delete review");
    }
    
    res.redirect("/account/");
  } catch (error) {
    console.error("Delete error:", error);
    req.flash("error", "Failed to delete review: " + error.message);
    res.redirect("/account/");
  }
}

module.exports = {
  addReview,
  buildEditReview,
  updateReview,
  deleteReview
};