// Shared helpers for reading/walking data.json. Every /api/curriculum/*
// route uses these so the "lazy stub" shape stays consistent everywhere.
const data = require('../../data.json');

// Same normalization the frontend uses for display + matching, so a path
// segment sent by the client always lines up with a key here.
function cleanKey(k) {
  return String(k).replace(/\t/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractHref(s) {
  if (typeof s !== 'string') return null;
  const m = s.match(/href="([^"]+)"/);
  return m ? m[1] : (s.startsWith('http') ? s : null);
}

// Counts actual lesson leaves (strings with a link) under a node. Stub
// nodes short-circuit to their precomputed count instead of recursing,
// so this stays correct even on a partially-lazy tree.
function countLessons(node) {
  if (typeof node === 'string') return extractHref(node) ? 1 : 0;
  if (!node || typeof node !== 'object') return 0;
  if (node.__lazy) return node.__count || 0;
  return Object.values(node).reduce((a, v) => a + countLessons(v), 0);
}

// Walks from startNode down through a list of *clean* key segments,
// matching each one against startNode's raw keys the same way the
// frontend matches shared-link segments.
function resolveNode(startNode, segments) {
  let node = startNode;
  for (const seg of segments) {
    if (!node || typeof node !== 'object') return undefined;
    const rawKey = Object.keys(node).find(k => !k.startsWith('_') && cleanKey(k) === seg);
    if (rawKey === undefined) return undefined;
    node = node[rawKey];
  }
  return node;
}

// One level of children for a node: leaf strings pass through untouched;
// any non-empty object child collapses into a { __lazy, __count } stub so
// the response stays small no matter how deep the real subtree goes.
function shallowChildren(node) {
  if (!node || typeof node !== 'object') return {};
  const out = {};
  for (const key of Object.keys(node)) {
    if (key.startsWith('_')) continue;
    const val = node[key];
    const cleaned = cleanKey(key);
    if (typeof val === 'string') {
      out[cleaned] = val;
    } else if (val && typeof val === 'object' && Object.keys(val).length > 0) {
      out[cleaned] = { __lazy: true, __count: countLessons(val) };
    } else {
      out[cleaned] = {};
    }
  }
  return out;
}

function topLevelSkeleton() {
  const out = {};
  for (const key of Object.keys(data)) {
    if (key.startsWith('_')) continue;
    out[key] = { __lazy: true, __count: countLessons(data[key]) };
  }
  return out;
}

// Server-side search across the whole tree (keys + book authors), so the
// client never has to download everything just to search it.
function searchAll(query) {
  const q = String(query || '').toLowerCase();
  if (!q) return [];
  const results = [];
  const bookMeta = data._bookMeta || {};
  const courseKeys = Object.keys(data).filter(k => !k.startsWith('_'));

  for (const course of courseKeys) {
    const courseLabel = cleanKey(course);
    if (courseLabel.toLowerCase().includes(q)) {
      results.push({ type: 'course', course, pathSegs: [courseLabel], path: courseLabel, label: courseLabel, key: courseLabel });
    }

    const walk = (node, segs) => {
      if (!node || typeof node !== 'object') return;
      for (const key of Object.keys(node)) {
        if (key.startsWith('_')) continue;
        const val = node[key];
        const cleaned = cleanKey(key);
        const newSegs = [...segs, cleaned];
        const pathStr = newSegs.join(' › ');

        if (typeof val === 'string') {
          const href = extractHref(val);
          if (href && (cleaned.toLowerCase().includes(q) || pathStr.toLowerCase().includes(q))) {
            results.push({ type: 'lesson', course, pathSegs: newSegs, path: pathStr, label: cleaned, href, key: cleaned });
          }
        } else if (val && typeof val === 'object') {
          const meta = bookMeta[key] || bookMeta[cleaned];
          const authorMatch = meta && meta.author && meta.author.toLowerCase().includes(q);
          if (cleaned.toLowerCase().includes(q) || pathStr.toLowerCase().includes(q) || authorMatch) {
            results.push({
              type: meta ? 'book' : 'folder', course, pathSegs: newSegs,
              path: pathStr, label: cleaned,
              author: meta ? (meta.author || '') : undefined,
              lcount: countLessons(val), key: cleaned
            });
          }
          walk(val, newSegs);
        }
      }
    };
    walk(data[course], [courseLabel]);
  }

  return results.slice(0, 60);
}

module.exports = { data, cleanKey, extractHref, countLessons, resolveNode, shallowChildren, topLevelSkeleton, searchAll };
