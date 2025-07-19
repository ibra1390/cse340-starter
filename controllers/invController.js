const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build Detail Page view by inv_id (Car identifier)
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  const inv_id = req.params.invId
  try {
    const data = await invModel.getCarbyInvId(inv_id)
    const car = data[0]

    if (!car) {
      const err = new Error("Vehicle not found")
      err.status = 404
      return next(err)
    }

    const grid = await utilities.buildCarDetailScreen(car)
    const nav = await utilities.getNav()

    res.render("./inventory/classification", {
      title: `${car.inv_year} ${car.inv_make} ${car.inv_model}`,
      nav,
      grid,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Route that triggers a test error
 * ************************** */
invCont.linkError = async (req, res, next) => {
  const errParam = req.params.errParam
  if (errParam == "0") {
    const err = new Error("Internal Server Error")
    err.status = 500
    return next(err)
  }
}

module.exports = invCont
