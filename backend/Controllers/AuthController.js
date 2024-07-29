const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const sendVerificationEmail = require('./SendEmail');

const createToken = (email, expiresIn = '1h') => jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn });

const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({ message: "User already exists, you can login", success: false });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        const token = createToken(email);
        sendVerificationEmail(email, token);

        res.status(201).json({ message: "Signup successful, Please verify your email", success: true });
    } catch (err) {
        res.status(500).json({ message: "Internal server error", success: false });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(403).json({ message: 'Auth failed email or password is incorrect', success: false });
        }

        if (!user.isVerified) {
            const token = createToken(email);
            sendVerificationEmail(email, token);
            return res.status(403).json({ message: 'Verify your email first from email link', success: false });
        }

        const jwtToken = jwt.sign({ email: user.email, _id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.status(200).json({ message: 'Login success', success: true, jwtToken, email, name: user.name });
    } catch (err) {
        res.status(500).json({ message: "Internal server error", success: false });
    }
}

module.exports = { signup, login };
