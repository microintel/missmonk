// GET /api/curriculum/search?q=term&lang=kn
// Searches the whole tree server-side so the search box works without the
// client ever downloading the full curriculum. `lang` (optional, defaults
// to 'en') is the user's selected content language — book results whose
// _bookMeta entry isn't marked available in that language are left out.
const { searchAll } = require('../_lib/data');

module.exports = (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const q = req.query.q;
  if (!q || !String(q).trim()) return res.status(200).json([]);

  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600');
  return res.status(200).json(searchAll(q, req.query.lang));
};
