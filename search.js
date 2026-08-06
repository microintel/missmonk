// GET /api/curriculum/search?q=term
// Searches the whole tree server-side so the search box works without the
// client ever downloading the full curriculum.
const { searchAll } = require('../_lib/data');

module.exports = (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const q = req.query.q;
  if (!q || !String(q).trim()) return res.status(200).json([]);

  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600');
  return res.status(200).json(searchAll(q));
};
