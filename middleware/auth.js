// require('dotenv').config();
const jwt = require('jsonwebtoken');
const messages = require("../controller/message")
const model = require('../models/index');

const validateToken = async (req, res, next) => {
    // res.json(req.body)
    try {
        const token = req.headers["authorization"].split(' ')[1];
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        const username = decoded["username"]
        var language = "en"
        if (!token) {
            res.status(401).json({
                access: "failed",
                message: messages[language]?.userToken,
            });
            return
        }
        const storedToken = await model.adm_user_token.findOne({
            where: { token: token }
        });

        if (!storedToken) {
            res.status(401).json({
                access: "failed",
                message: messages[language]?.userIlegal,
            });
            return
        }
        if (new Date() > storedToken.expired_at) {
            await model.adm_user_token.destroy({
                where: {
                    username: username
                }
            });
            res.status(401).json({
                access: "failed",
                message: messages[language]?.userSession,
            });
            return
        }
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            access: "failed",
            message: messages[language]?.userSession,
        });
        return
    }
};

module.exports = validateToken;
