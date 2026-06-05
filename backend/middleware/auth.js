import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
	let token;
	const authHeader = req.headers.authorization || req.headers.Authorization;
	if (authHeader && authHeader.startsWith('Bearer ')) {
		token = authHeader.split(' ')[1];
	}

	if (!token) {
		return res.status(401).json({ success: false, error: 'Not authorized, token missing' });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
		// attach user id
		req.user = { id: decoded.id };
		// optionally fetch user
		req.userDoc = await User.findById(decoded.id).select('-password');
		next();
	} catch (err) {
		return res.status(401).json({ success: false, error: 'Not authorized, token invalid' });
	}
};

export default protect;

