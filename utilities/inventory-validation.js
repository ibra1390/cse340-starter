const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};

/* **********************************
 *  Classification Validation Rules 
 * ********************************* */
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .isLength({ min: 1 })
      .isAlpha()
      .withMessage("Provide a correct classification name."),
  ];
};

/* **********************************
 *  Check Classification Data 
 * ********************************* */
validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body;
  let errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.render("inventory/add-classification", {
      errors,
      title: "Add Classification",
      nav,
      classification_name,
    });
  }
  next();
};

/* **********************************
 *  Inventory Validation Rules 
 * ********************************* */
validate.inventoryRules = () => {
  return [
    body("classification_id")
      .trim()
      .isInt({ no_symbols: true })
      .withMessage("The vehicle's classification is required."),

    body("inv_make")
      .trim()
      .escape()
      .isLength({ min: 3 })
      .withMessage("A vehicle make is required."),

    body("inv_model")
      .trim()
      .escape()
      .isLength({ min: 3 })
      .withMessage("A vehicle model is required."),

    body("inv_description")
      .trim()
      .escape()
      .isLength({ min: 3 })
      .withMessage("A vehicle description is required."),

    body("inv_image")
      .trim()
      .isLength({ min: 6 })
      .matches(/\.(jpg|jpeg|png|webp)$/i)
      .withMessage("A vehicle image path is required and must be an image."),

    body("inv_thumbnail")
      .trim()
      .isLength({ min: 6 })
      .matches(/\.(jpg|jpeg|png|webp)$/i)
      .withMessage("A vehicle thumbnail path is required and must be an image."),

    body("inv_price")
      .trim()
      .isDecimal()
      .withMessage("A vehicle price is required."),

    body("inv_year")
      .trim()
      .isInt({ min: 1900, max: 2099 })
      .withMessage("A vehicle year is required."),

    body("inv_miles")
      .trim()
      .isInt({ no_symbols: true })
      .withMessage("The vehicle's miles is required."),

    body("inv_color")
      .trim()
      .escape()
      .isLength({ min: 3 })
      .withMessage("The vehicle's color is required.")
  ];
};

/* **********************************
 *  Check Inventory Data 
 * ********************************* */
validate.checkInventoryData = async (req, res, next) => {
  const {
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;
  
  let errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList(classification_id);
    
    return res.render("inventory/add-inventory", {
      errors,
      title: "Add Vehicle",
      nav,
      classificationSelect,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
    });
  }
  next();
};

/* **********************************
 *  Check Update Data Inventory
 * ********************************* */
validate.checkUpdateData = async (req, res, next) => {
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;
  
  let errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList(classification_id);
    const itemName = `${inv_make} ${inv_model}`;
    return res.render("inventory/edit-inventory", {
      errors,
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
    });
  }
  next();
};

module.exports = validate;