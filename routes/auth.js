const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const fetchUser = require("../middleware/fetchuser");
const secretKey = process.env.SECRET_KEY;

router.post(
  "/createuser",
  [
    body("name", "Please enter a valid name").isLength({ min: 3 }),
    body("email", "Please enter a valid email").isEmail(),
    body("password", "Invalid Password :- min 5 characters required").isLength({
      min: 5,
    }),
  ],

  async (req, res) => {
    let success = false;

    const result = validationResult(req);
    if (!result.isEmpty()) {
      success = false;
      return res.status(400).json({ success, errors: result.array() });
    }

    try {
      const { name, email, password } = req.body;

      const salt = await bcrypt.genSalt(10);
      const secretPass = await bcrypt.hash(password, salt);

      const user = new User({
        name: name,
        email: email,
        password: secretPass,
      });

      await user
        .save()
        .then((value) => {
          success = true;
          const userId = value.id;
          const authToken = jwt.sign(userId, secretKey);
          res.json({ success, authToken });
        })
        .catch((err) => {
          success = false;
          res.json({ success, Error: err.message });
        });
    } catch (error) {
      success = false;

      res.status(500).json({ success, Error: "Internal server error" });
    }
  }
);

router.post(
  "/login",
  [
    body("email", "Please enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    let success = false;

    const result = validationResult(req);
    if (!result.isEmpty()) {
      success = false;
      return res.status(400).json({ success, errors: result.array() });
    }
    const { email, password } = req.body;
    try {
      await User.findOne({ email }).then(async (value) => {
        if (!value) {
          return res.status(400).json({
            success,
            Error: "please try to login with correct credentials,1",
          });
        }
        const passwordDcrypt = await bcrypt.compare(password, value.password);

        if (!passwordDcrypt) {
          return res.status(400).json({
            success,
            Error: "please try to login with correct credentials 2",
          });
        } else {
          success = true;
          const userId = value.id;
          const authToken = jwt.sign(userId, secretKey);
          res.json({ success, authToken });
        }
      });
    } catch (error) {
      success = false;

      res.status(500).json({ success, Error: "Internal server error" });
    }
  }
);

router.post("/getuser", fetchUser, async (req, res) => {
  let success = false;
  try {
    const id = req.id;
    await User.findOne({ _id: id })
      .select("-password")
      .then((value) => {
        success = true;
        res.status(200).json({ value });
      });
  } catch (error) {
    res.status(500).json({ success, Error: "Internal server error" });
  }
});
module.exports = router;
