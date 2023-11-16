const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user");

router.get('/', userCtrl.findAllUser);
router.get('/profil', userCtrl.findOneUser);
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);
router.put('/update/:userId', userCtrl.updateUser);
router.delete('/:id', userCtrl.deleteUser);

module.exports = router;
