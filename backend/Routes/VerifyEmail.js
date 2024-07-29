const User = require('../Models/User');
const jwt = require('jsonwebtoken');
const path = require('path');

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        const secret = process.env.JWT_SECRET;
        const decoded = jwt.verify(token, secret);
        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            return res.status(404).sendFile(path.join(__dirname, '../public/verificationError.html'));
        }

        user.isVerified = true;
        await user.save();

        res.status(200).sendFile(path.join(__dirname, '../public/verificationSuccess.html'));
    } catch (err) {
        res.status(500).sendFile(path.join(__dirname, '../public/verificationError.html'));
    }
};

module.exports = verifyEmail;
