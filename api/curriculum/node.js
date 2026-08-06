// GET /api/curriculum/node?course=<raw top-level key>&path=seg1|seg2|...
// Returns the immediate children of the node at that path (each still
// collapsed one level further if it has its own children). Called every
// time the user drills into a course/subject/chapter in the UI.
const { data, shallowChildren, resolveNode } = require('../_lib/data');

module.exports = (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { course, path } = req.query;
  if (!course || typeof course !== 'string') {
    return res.status(400).json({ error: 'course is required' });
  }
  const courseNode = data[course];
  if (!courseNode) return res.status(404).json({ error: 'Course not found' });

  const segments = path ? String(path).split('|').filter(Boolean) : [];
  const node = resolveNode(courseNode, segments);
  if (node === undefined) return res.status(404).json({ error: 'Path not found' });

  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
  return res.status(200).json(shallowChildren(node));
};
