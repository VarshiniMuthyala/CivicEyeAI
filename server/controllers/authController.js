import bcrypt from 'bcryptjs';
import { dbService } from '../services/dbService.js';
import { signToken } from '../config/jwt.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'citizen', department = null } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await dbService.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    // Role safety: only allow department role if department is specified
    const assignedRole = ['citizen', 'admin', 'department'].includes(role) ? role : 'citizen';
    const assignedDepartment = assignedRole === 'department' ? department : null;

    const newUser = await dbService.createUser({
      name,
      email,
      password,
      role: assignedRole,
      department: assignedDepartment
    });

    const token = signToken({ id: newUser.id, role: newUser.role });

    return res.status(201).json({
      message: 'Account registered successfully',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed: ' + error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await dbService.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken({ id: user.id, role: user.role });
    const { password_hash, ...safeUser } = user;

    return res.json({
      message: 'Login successful',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed: ' + error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    return res.json({ user: req.user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
