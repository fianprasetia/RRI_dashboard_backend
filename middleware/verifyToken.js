
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1];
    if (!token == null) {
        res.status(401).json({
            access: "failed",
            // message: messages[language]?.userToken,
        });
        return
    }
    // if(res.status(500)){
    //     res.json({
    //         access: "failed",
    //         // message: messages[language]?.userAccess,
    //         message: "Please refresh your browser",
    //       });
    // }
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
}
module.exports = verifyToken;