const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const CalendarEvent = require('../models/CalendarEvent');

// GET /api/calendar/events?month=2025-12
router.get('/events', auth, async (req, res) => {
  try {
    const { month } = req.query; // format: YYYY-MM
    const baseDate = month ? new Date(month + '-01') : new Date();

    const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
    const end = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0, 23, 59, 59);

    const events = await CalendarEvent.find({
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 });

    res.json(
      events.map(e => ({
        id: e._id,
        title: e.title,
        type: e.type,
        date: e.date.toISOString().slice(0, 10), // YYYY-MM-DD
        time: e.time,
        color: e.color,
        location: e.location,
        description: e.description,
      }))
    );
  } catch (err) {
    console.error('❌ Error fetching calendar events:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

module.exports = router;
