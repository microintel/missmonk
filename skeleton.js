// GET /api/curriculum/skeleton
// Tiny first response: book metadata (needed for cover art) plus every
// top-level course collapsed into a { __lazy, __count } stub. The frontend
// expands each course's real content on demand via /api/curriculum/node.
const { data, topLevelSkeleton } = require('../_lib/data');

module.exports = (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
  return res.status(200).json({
    _bookMeta: data._bookMeta || {},
    ...topLevelSkeleton()
  });
};
