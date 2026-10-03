const Product = require("../models/Product");

async function listProducts(req, res) {
  try {
    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    } else {
      filter.status = "Active";
    }

    if (req.query.search) {
      filter.$or = [
        {
          name: {
            $regex: req.query.search,
            $options: "i"
          }
        },
        {
          category: {
            $regex: req.query.search,
            $options: "i"
          }
        },
        {
          location: {
            $regex: req.query.search,
            $options: "i"
          }
        }
      ];
    }

    const products = await Product.find(filter)
      .populate("farmer", "name email phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error("Product list error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch products."
    });
  }
}

async function getProduct(req, res) {
  const product = await Product.findById(
    req.params.id
  ).populate(
    "farmer",
    "name email phone profile"
  );

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found."
    });
  }

  res.json({
    success: true,
    data: product
  });
}

async function listMyProducts(req, res) {
  const products = await Product.find({
    farmer: req.user.id
  }).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: products.length,
    data: products
  });
}

async function createProduct(req, res) {
  try {
    const product = await Product.create({
      ...req.body,
      farmer: req.user.id,
      status:
        Number(req.body.quantity || 0) > 0
          ? "Active"
          : "Out of Stock"
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

async function updateProduct(req, res) {
  try {
    const data = { ...req.body };

    if (data.quantity !== undefined) {
      data.status =
        Number(data.quantity) > 0
          ? "Active"
          : "Out of Stock";
    }

    const product =
      await Product.findOneAndUpdate(
        {
          _id: req.params.id,
          farmer: req.user.id
        },
        { $set: data },
        {
          new: true,
          runValidators: true
        }
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found."
      });
    }

    res.json({
      success: true,
      message: "Product updated successfully.",
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

async function deleteProduct(req, res) {
  const product =
    await Product.findOneAndDelete({
      _id: req.params.id,
      farmer: req.user.id
    });

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found."
    });
  }

  res.json({
    success: true,
    message: "Product deleted successfully."
  });
}

module.exports = {
  listProducts,
  getProduct,
  listMyProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
