// routes/postChatRoutes.js
import express from 'express';
import { verifyToken } from '../../middleware/verifyToken.js';
import {
  getOrCreateChat,
  sendMessage,
  getPostChats,
  getMyChats,
} from '../../controllers/post/chatController.js';

const router = express.Router();

// My chats across all posts (applicant dashboard)
router.get('/my-chats', verifyToken, getMyChats);

// All chats on a specific post (post-owner view)
router.get('/:postId/chats', verifyToken, getPostChats);

// Get or create a 1:1 chat between currentUser and participantId on a post
router.get('/:postId/chat/:participantId', verifyToken, getOrCreateChat);

// Send a message in a chat
router.post('/:postId/chat/:participantId/send', verifyToken, sendMessage);

export default router;

// ─────────────────────────────────────────────────────────────────────────────
// ADD TO YOUR EXISTING postRoutes.js:
//
//   router.put('/:id/finalize', verifyToken, finalizePost);
//
// ADD TO postController.js:
//
// export const finalizePost = async (req, res) => {
//   try {
//     const post = await Post.findById(req.params.id);
//     if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
//     if (post.author.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ success: false, message: 'Unauthorized' });
//     }
//     post.status = 'closed';
//     await post.save();
//     res.status(200).json({ success: true, data: post });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };
//
// IN server.js / app.js register:
//   import postChatRoutes from './routes/postChatRoutes.js';
//   app.use('/api/posts', postChatRoutes);
// ─────────────────────────────────────────────────────────────────────────────