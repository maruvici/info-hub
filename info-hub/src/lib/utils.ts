export function buildCommentTree(flatComments: any[]) {
  const map = new Map();
  const roots: any[] = [];

  // 1. Initialize map
  flatComments.forEach((comment) => {
    // Ensure we are working with clean strings
    map.set(comment.id, { ...comment, replies: [] });
  });

  // 2. Link children to parents
  flatComments.forEach((comment) => {
    if (comment.parentId) {
      const parent = map.get(comment.parentId);
      
      if (parent) {
        // SUCCESS: Parent found, adding child
        parent.replies.push(map.get(comment.id));
      } else {
        // FAILURE: Found a child, but the parent isn't in this list
        console.warn(`[Orphan Found] Comment ${comment.id} claims parent ${comment.parentId}, but that parent ID is not in the map.`);
        console.log("Available IDs in Map:", Array.from(map.keys()));
        // Optional: treat orphans as root comments so they at least appear?
        roots.push(map.get(comment.id)); 
      }
    } else {
      // It's a root comment
      roots.push(map.get(comment.id));
    }
  });

  // 3. Sort replies by date (oldest first usually makes sense for conversation flow)
  roots.forEach(root => sortReplies(root));

  return roots;
}

// Helper to sort nested replies recursively
function sortReplies(comment: any) {
  if (comment.replies?.length > 0) {
    comment.replies.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    comment.replies.forEach((reply: any) => sortReplies(reply));
  }
}