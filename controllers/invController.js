const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const invCont = {};

/* ***************************
 *  Build inventory by classification view 
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();

   if (!data || data.length === 0) {
    res.render("./inventory/classification", {
      title: "NO VEHICLES FOUND",
      nav,
      grid: "No vehicles in this classification.",
    });
    return;
  }

  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ***************************
 *  Build Detail Page view by inv_id 
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  const inv_id = req.params.invId;
  try {
    const data = await invModel.getCarbyInvId(inv_id);
    const car = data[0];
    const grid = await utilities.buildCarDetailScreen(car);
    const nav = await utilities.getNav();
    res.render("./inventory/classification", {
      title: `${car.inv_year} ${car.inv_make} ${car.inv_model}`,
      nav,
      grid,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Route that triggers a test error 
 * ************************** */
invCont.linkError = async (req, res, next) => {
  const errParam = req.params.errParam;
  if (errParam == "0") {
    const err = new Error("Internal Server Error");
    err.status = 500;
    return next(err);
  }
};

/* ***************************
 *  Build Management View 
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList();
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null,
    classificationSelect,
  });
};

/* ***************************
 * Build New Classification View 
 * ************************** */
invCont.newClassificationView = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  });
};

/* ***************************
 * Process New Classification 
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
  const { classification_name } = req.body;
  const insertResult = await invModel.addClassification(classification_name);

  if (insertResult) {
    nav = await utilities.getNav(); 
    req.flash("notice", `The ${insertResult.classification_name} classification was successfully added.`);
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the insert failed.");
    res.status(501).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
    });
  }
};

/* ***************************
 * Build New Inventory View 
 * ************************** */
invCont.newInventoryView = async function (req, res, next) {
  let nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList();
  res.render("./inventory/add-inventory", {
    title: "Add New Inventory",
    nav,
    classificationSelect: classificationSelect,
    errors: null,
  });
};

/* ***************************
 * Process New Inventory 
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
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
  const insertResult = await invModel.addInventory(
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  );

  if (insertResult) {
    const itemName = insertResult.inv_make + " " + insertResult.inv_model
    const classificationSelect = await utilities.buildClassificationList()
    req.flash("message success", `The ${itemName} was successfully added.`)
    res.status(201).render("./inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
      classificationSelect,
    })
  } else {
    const classificationSelect = await utilities.buildClassificationList()
    req.flash("message warning", "Sorry, the insert failed.")
    res.status(501).render("./inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationSelect: classificationSelect,
      errors: null,
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}



module.exports = invCont;