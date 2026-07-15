// middleware/controlRoomAuth.js
import jwt from 'jsonwebtoken';

const CONTROL_ROOM_SECRET = process.env.CONTROL_ROOM_JWT_SECRET || process.env.JWT_SECRET;

export const signControlRoomToken = (creatorId) =>
  jwt.sign({ creatorId, scope: 'control-room' }, CONTROL_ROOM_SECRET, { expiresIn: '2h' });

export const requireControlRoomAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, message: 'Control Room session required.' });

    const decoded = jwt.verify(token, CONTROL_ROOM_SECRET);
    if (decoded.scope !== 'control-room') {
      return res.status(401).json({ success: false, message: 'Invalid session.' });
    }

    req.creatorId = decoded.creatorId;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Control Room session expired. Please log in again.' });
  }
};