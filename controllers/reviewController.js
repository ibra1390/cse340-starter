const reviewModel = require("../models/review-model");
const utilities = require("../utilities");

/* ***************************
 *  Add new review
 * ************************** */
async function addReview(req, res) {
  const { review_text, inv_id } = req.body;
  const account_id = res.locals.accountData.account_id;
  
  try {
    await reviewModel.addReview(review_text, inv_id, account_id);
    req.flash("notice", "Review added successfully!");
    res.redirect(`/inv/detail/${inv_id}`);
  } catch (error) {
    req.flash("error", "Failed to add review");
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
    const reviewData = await reviewModel.getReviewById(review_id);
    res.render("review/edit-review", {
      title: "Edit Review",
      nav,
      errors: null,
      review_id: reviewData.review_id,
      review_text: reviewData.review_text,
    });
  } catch (error) {
    req.flash("error", "Review not found");
    res.redirect("/account/");
  }
}

/* ***************************
 *  Update review
 * ************************** */
async function updateReview(req, res) {
  const { review_id, review_text } = req.body;
  
  try {
    await reviewModel.updateReview(review_id, review_text);
    req.flash("success", "Review updated successfully!");
    res.redirect("/account/");
  } catch (error) {
    req.flash("error", "Failed to update review");
    res.redirect(`/review/edit/${review_id}`);
  }
}

/* ***************************
 *  Delete review
 * ************************** */
async function deleteReview(req, res) {
  const review_id = req.params.review_id;
  
  try {
    await reviewModel.deleteReview(review_id);
    req.flash("success", "Review deleted successfully!");
    res.redirect("/account/");
  } catch (error) {
    req.flash("error", "Failed to delete review");
    res.redirect("/account/");
  }
}

module.exports = {
  addReview,
  buildEditReview,
  updateReview,
  deleteReview
};