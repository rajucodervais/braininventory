import jwt from "jsonwebtoken";
const TOKEN_SECRET = 'asdfasdfasdflajsdlfaksdflasdf'
const auth = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, TOKEN_SECRET);
    if (!decodedToken) {
        res.status(401).send('you are not authorized')
    } else {
        next();
    }
};

export default auth;