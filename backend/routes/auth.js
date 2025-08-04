// routes/auth.js
import express from 'express';
const router = express.Router();

router.post('/set-token', (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Token missing" });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: 3600 * 1000, // 1 hour
  });

  res.status(200).json({ message: 'Token set in cookie' });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out' });
});


export default router;
