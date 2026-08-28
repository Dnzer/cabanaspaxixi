const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'reservas.json');

fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const cabins = ['Vale dos Sonhos', 'Cabana Mirante', 'Jardim Secreto', 'Valle Sagrado'];
function readReservations(){
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return []; }
}
function writeReservations(data){ fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); }
function validDate(s){ return /^\\d{4}-\\d{2}-\\d{2}$/.test(s) && !Number.isNaN(new Date(s+'T00:00:00').getTime()); }
function overlaps(aStart, aEnd, bStart, bEnd){ return aStart < bEnd && bStart < aEnd; }

app.get('/api/cabins', (req,res) => res.json(cabins));
app.get('/api/reservations', (req,res) => res.json(readReservations()));

app.post('/api/reservations', (req,res) => {
  const { cabin, checkIn, checkOut, guests, name, email, phone } = req.body || {};
  if (!cabins.includes(cabin) || !validDate(checkIn) || !validDate(checkOut) || checkIn >= checkOut || !name || !email || !phone) {
    return res.status(400).json({ error: 'Preencha corretamente todos os campos.' });
  }
  const reservations = readReservations();
  const conflict = reservations.some(r => r.cabin === cabin && r.status !== 'cancelled' && overlaps(checkIn, checkOut, r.checkIn, r.checkOut));
  if (conflict) return res.status(409).json({ error: 'Essa cabana não está disponível para o período escolhido.' });

  const reservation = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2,7),
    cabin, checkIn, checkOut, guests: Number(guests || 2), name, email, phone,
    status: 'confirmed', createdAt: new Date().toISOString()
  };
  reservations.push(reservation);
  writeReservations(reservations);
  res.status(201).json(reservation);
});

app.listen(PORT, () => console.log(`Cabanas Paxixi: http://localhost:${PORT}`));
