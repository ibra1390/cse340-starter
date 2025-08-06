const pool = require("../database/");

/* ***************************
 *  Create new review
 * ************************** */
async function addReview(review_text, inv_id, account_id) {
  try {
    const sql = "INSERT INTO review (review_text, inv_id, account_id) VALUES ($1, $2, $3) RETURNING *";
    return await pool.query(sql, [review_text, inv_id, account_id]);
  } catch (error) {
    return error.message;
  }
}

/* ***************************
 *  Get reviews by inventory item
 * ************************** */
async function getReviewsByInventoryId(inv_id) {
  try {
    const sql = `
      SELECT r.*, a.account_firstname, a.account_lastname 
      FROM review r
      JOIN account a ON r.account_id = a.account_id
      WHERE r.inv_id = $1
      ORDER BY r.review_date DESC`;
    return await pool.query(sql, [inv_id]);
  } catch (error) {
    return error.message;
  }
}

/* ***************************
 *  Get reviews by account
 * ************************** */
async function getReviewsByAccountId(account_id) {
  try {
    const sql = `
      SELECT r.*, i.inv_make, i.inv_model 
      FROM review r
      JOIN inventory i ON r.inv_id = i.inv_id
      WHERE r.account_id = $1
      ORDER BY r.review_date DESC`;
    return await pool.query(sql, [account_id]);
  } catch (error) {
    return error.message;
  }
}

/* ***************************
 *  Update review
 * ************************** */
async function updateReview(review_id, review_text) {
  try {
    const sql = "UPDATE review SET review_text = $1 WHERE review_id = $2 RETURNING *";
    return await pool.query(sql, [review_text, review_id]);
  } catch (error) {
    return error.message;
  }
}

/* ***************************
 *  Delete review
 * ************************** */
async function deleteReview(review_id) {
  try {
    const sql = "DELETE FROM review WHERE review_id = $1 RETURNING *";
    return await pool.query(sql, [review_id]);
  } catch (error) {
    return error.message;
  }
}

module.exports = {
  addReview,
  getReviewsByInventoryId,
  getReviewsByAccountId,
  updateReview,
  deleteReview
};