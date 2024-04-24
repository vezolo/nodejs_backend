const router = require("express").Router();
const { getAllUsers, getUserById, updateUser, checkUser } = require("../Controllers/User");

router.get("/users", getAllUsers)
.get("/user/:_id?", getUserById)
.get("/check_user", checkUser)
.put("/user", updateUser)

module.exports = router;