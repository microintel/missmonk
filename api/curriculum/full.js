// GET /api/curriculum/full
// The complete, un-lazified curriculum. The Books tab and Progress page
// need to enumerate every lesson at once (to compute totals/percentages),
// so they fetch this the first time either is opened — everywhere else in
// the app navigates lazily via /api/curriculum/node instead.
const { data } = require('../_lib/data');

module.exports = (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
  return res.status(200).json(data);
};
