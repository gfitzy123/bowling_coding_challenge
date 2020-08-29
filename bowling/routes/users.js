var express = require('express');
var router = express.Router();
const User = require('../api/models/User');

/* GET users listing. */
router.get('/:id', async function(req, res) {
  console.log('req', req.query)
  const user = await User.findOne({ id: req.query.id});
  const response = {
    code: 200, 
    message: 'User succesfully fetched.',
    data: user
  }
  res.status(200).send(response)
});

router.get('/', async function(req, res) {
  console.log('req', req.query)
  const users = await User.findAll();
  const response = {
    code: 200, 
    message: 'Users succesfully fetched.',
    data: users
  }
  res.status(200).send(response)
});

/* PUT users listing. */
router.put('/:id/', async function(req, res) {
  if (req.body.name){
      const user = await User.update({ name: req.body.name});
      const response = {
        code: 200, 
        message: 'User succesfully updated.',
        data: user
      }
      res.status(200).send(response)
    } else {
      const response = {
        code: 200, 
        message: 'A "name" field is required to update user name',
        data: null
      }
      res.status(500).send(response)
  }
});

/* POST users listing. */
router.post('/', async function(req, res) {
  if (req.body.name){
    const user = await User.create({ name: req.body.name});
    const response = {
      code: 200, 
      message: 'User succesfully created.',
      data: user
    }
    res.status(200).send(response)
  } else {
    const response = {
      code: 500, 
      message: 'A "name" field is required to create a user.',
      data: null
    }
    res.status(500).send(response)
  }
});

/* DELETE users listing. */
router.delete('/:id', async function(req, res) {
  if (req.body.name){
    const user = await User.delete({ name: req.body.name});
    const response = {
      code: 500, 
      message: 'User succesfully deleted.',
      data: user
    }
    res.status(200).send(response)
  } else {
    const response = {
      code: 500, 
      message: 'A "name" field is required to delete a user.',
      data: null
    }
    res.status(500).send(response)
  }
});


module.exports = router;
