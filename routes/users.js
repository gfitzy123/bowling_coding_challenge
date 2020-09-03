var express = require("express");
var router = express.Router();
const User = require("../api/models/User");

/* GET users listing. */
router.get("/:id", async function (req, res) {
  const user = await User.findOne({ id: req.query.id });
  const response = {
    status: 200,
    message: "User succesfully fetched.",
    data: user,
  };
  res.status(200).send(response);
});

router.get("/", async function (req, res) {
  const users = await User.findAll();
  const response = {
    status: 200,
    message: "Users succesfully fetched.",
    data: users,
  };
  res.status(200).send(response);
});

/* PUT users listing. */
router.put("/:id/", async function (req, res) {
  if (req.body.name) {
    const user = await User.update({ name: req.body.name });
    const response = {
      status: 200,
      message: "User succesfully updated.",
      data: user,
    };
    res.status(200).send(response);
  } else {
    const response = {
      status: 200,
      message: 'A "name" field is required to update user name',
      data: null,
    };
    res.status(500).send(response);
  }
});

/* POST users listing. */
router.post("/", async function (req, res) {
  if (req.query.name || req.body.name) {
    const name = req.query.name || req.body.name;
    const user = await User.create({ name });
    const response = {
      status: 200,
      message: "User succesfully created.",
      data: user,
    };
    res.status(200).send(response);
  } else {
    const response = {
      status: 500,
      message: 'A "name" field is required to create a user.',
      data: null,
    };
    res.status(500).send(response);
  }
});

/* DELETE users listing. */
router.delete("/:id", async function (req, res) {
  if (req.body.name) {
    const user = await User.delete({ name: req.body.name });
    const response = {
      status: 500,
      message: "User succesfully deleted.",
      data: user,
    };
    res.status(200).send(response);
  } else {
    const response = {
      status: 500,
      message: 'A "name" field is required to delete a user.',
      data: null,
    };
    res.status(500).send(response);
  }
});

module.exports = router;
