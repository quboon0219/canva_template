require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Stripe = require('stripe');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || '');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// setup uploads folder for proxy
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR)
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + file.originalname.replace(/\W+/g,'_');
    cb(null, name);
  }
});
const upload = multer({ storage });

// sqlite DB
let db;
(async () => {
  db = await open({ filename: './data.db', driver: sqlite3.Database });
  await db.exec(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT UNIQUE, password TEXT, profile TEXT)`);
  await db.exec(`CREATE TABLE IF NOT EXISTS purchases (id INTEGER PRIMARY KEY, userId INTEGER, sessionId TEXT, data TEXT, createdAt INTEGER)`);
})();

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).send({ error: 'email/password required' });
  const hash = await bcrypt.hash(password, 10);
  try {
    await db.run('INSERT INTO users (email, password) VALUES (?,?)', email, hash);
    res.send({ success: true });
  } catch (e) {
    res.status(400).send({ error: 'already exists' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const row = await db.get('SELECT * FROM users WHERE email = ?', email);
  if (!row) return res.status(401).send({ error: 'invalid' });
  const ok = await bcrypt.compare(password, row.password);
  if (!ok) return res.status(401).send({ error: 'invalid' });
  const token = jwt.sign({ id: row.id, email }, JWT_SECRET, { expiresIn: '7d' });
  res.send({ token, profile: { email } });
});

// auth middleware
function auth(req, res, next) {
  const authh = req.headers.authorization;
  if (!authh) return res.status(401).send({ error: 'no auth' });
  const token = authh.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) { res.status(401).send({ error: 'invalid token' }); }
}

// Asset proxy upload (stores file locally and returns URL)
app.post('/api/assets/upload-proxy', auth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).send({ error: 'file required' });
  const url = `${req.protocol}://${req.get('host')}/assets/${req.file.filename}`;
  res.send({ url });
});

// serve uploaded assets
app.use('/assets', express.static(UPLOAD_DIR));

// Stripe create checkout
app.post('/api/stripe/create-checkout', auth, async (req, res) => {
  const { line_items, success_url, cancel_url } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      success_url,
      cancel_url,
      metadata: { userId: String(req.user.id) }
    });
    res.send({ url: session.url });
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: 'stripe error' });
  }
});

// Stripe webhook endpoint (verify signature if configured)
app.post('/api/stripe/webhook', bodyParser.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  try {
    let event;
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      event = JSON.parse(req.body.toString());
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = (session.metadata && session.metadata.userId) ? Number(session.metadata.userId) : null;
      await db.run('INSERT INTO purchases (userId, sessionId, data, createdAt) VALUES (?,?,?,?)', [userId, session.id, JSON.stringify(session), Date.now()]);
      console.log('Purchase recorded', session.id, 'userId=', userId);
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error', err.message || err);
    res.status(400).send(`Webhook error: ${err.message || err}`);
  }
});

const port = process.env.PORT || 4242;
app.listen(port, () => console.log(`Server running on ${port}`));
