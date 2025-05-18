const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('express-openid-connect');

// Configuração do Auth0
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SESSION_SECRET,
  baseURL: process.env.AUTH0_CALLBACK_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`
};

// Middleware de autenticação Auth0
const authMiddleware = auth(config);

// Middleware para verificar se usuário está autenticado
const isAuthenticated = (req, res, next) => {
  if (!req.oidc.isAuthenticated()) {
    return res.redirect('/login');
  }
  next();
};

// Middleware JWT existente
const jwtAuth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Por favor, faça login.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.id });

    if (!user) {
      return res.status(401).json({ message: 'Por favor, faça login.' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Por favor, faça login.' });
  }
};

module.exports = {
  auth: authMiddleware,
  isAuthenticated,
  jwtAuth
};