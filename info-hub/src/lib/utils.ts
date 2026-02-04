export function buildCommentTree(flatComments: any[]) {
  const map = new Map();
  const roots: any[] = [];

  // 1. Initialize map with all comments
  flatComments.forEach((comment) => {
    map.set(comment.id, { ...comment, replies: [] });
  });

  // 2. Attach children to parents
  flatComments.forEach((comment) => {
    if (comment.parentId) {
      const parent = map.get(comment.parentId);
      if (parent) {
        parent.replies.push(map.get(comment.id));
      }
    } else {
      roots.push(map.get(comment.id));
    }
  });

  return roots;
}