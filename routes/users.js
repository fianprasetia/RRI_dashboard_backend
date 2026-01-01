var express = require("express");
var router = express.Router();
const controller = require("../controller/index");

router.post("/", controller.users.selectUsers);
router.post("/web", controller.users.selectUsersWeb);
router.post("/mobile", controller.users.selectUsersMobile);
router.post("/insert", controller.users.insertUsers);
router.post("/username", controller.users.selectUsersByUsername);
router.post("/authentication", controller.users.selectAuthByUsername);
router.post("/authenticationmobile", controller.users.selectAuthMobileByUsername);
router.post("/update/authentication", controller.users.insertAuthByUsername);
router.post("/update/authenticationmobile", controller.users.insertAuthMobileByUsername);
router.post("/update/copyauthentication", controller.users.insertAuthCopyUser);
router.post("/update/copyauthenticationmobile", controller.users.insertAuthCopyUserMobile);
router.put("/update/:username", controller.users.updateUsers);
router.put("/updateworksite/:username", controller.users.updateWorksite);
// router.post("/update/password", controller.users.updatePasswordUser);
router.put("/password/:username", controller.users.updatePassword);


module.exports = router;
