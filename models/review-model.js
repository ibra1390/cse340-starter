const pool = require("../database/");

/* ***************************
 *  Create new review
 * ************************** */
async function addReview(review_text, inv_id, account_id) {
  try {
    const sql = "INSERT INTO review (review_text, inv_id, account_id) VALUES ($1, $2, $3) RETURNING *";
    const result = await pool.query(sql, [review_text, inv_id, account_id]);
    return result.rows[0];
  } catch (error) {
    console.error("Error adding review:", error);
    throw error;
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
    console.error("Error getting reviews by account:", error);
    throw error;
  }
}

/* ***************************
 *  Update review
 * ************************** */
async function updateReview(review_id, review_text) {
  try {
    const sql = `
      UPDATE review 
      SET review_text = $1, 
          review_date = NOW()
      WHERE review_id = $2
      RETURNING *`;
    
    const result = await pool.query(sql, [review_text, review_id]);
    return result.rowCount > 0; 
    
  } catch (error) {
    console.error("Database error in updateReview:", error);
    throw error;
  }
}

/* ***************************
 *  Delete review
 * ************************** */
async function deleteReview(review_id) {
  try {
    console.log("Deleting review with ID:", review_id); // Debug
    
    const sql = "DELETE FROM review WHERE review_id = $1 RETURNING *";
    const result = await pool.query(sql, [review_id]);
    
    console.log("Delete result:", result.rowCount); // Debug
    
    return result.rowCount > 0;
  } catch (error) {
    console.error("Database error in deleteReview:", error);
    throw error;
  }
}

/* ***************************
 *  Get single review by ID
 * ************************** */
async function getReviewById(review_id) {
  try {
    console.log("Executing query to get review by ID:", review_id); // Log de depuración
    
    const sql = `
      SELECT r.*, a.account_firstname, a.account_lastname,
             i.inv_make, i.inv_model, i.inv_year
      FROM review r
      JOIN account a ON r.account_id = a.account_id
      JOIN inventory i ON r.inv_id = i.inv_id
      WHERE r.review_id = $1`;
    
    const result = await pool.query(sql, [review_id]);
    console.log("Query result:", result.rows); // Log de depuración
    
    if (result.rows.length === 0) {
      console.log("No review found for ID:", review_id);
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error("Database error in getReviewById:", error);
    throw error;
  }
}

module.exports = {
  addReview,
  getReviewsByInventoryId,
  getReviewsByAccountId,
  updateReview,
  deleteReview,
  getReviewById
};