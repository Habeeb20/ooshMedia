import express from 'express';
import { verifyToken } from './../../middleware/verifyToken.js';
import {

  createPost, getFeed, getPost, updatePost, deletePost,
  toggleLike, repostPost, sharePost, addReview,
  applyToPost, getMyApplications, getPostApplications,
  updateApplicationStatus, withdrawApplication, getUserPosts
} from '../../controllers/post/postController.js';

const router = express.Router();

router.get('/feed', verifyToken, getFeed);
router.get('/my-applications', verifyToken, getMyApplications);
router.get('/user/:userId', verifyToken, getUserPosts);
router.get('/my-posts', verifyToken, getUserPosts);

router.post('/', verifyToken, createPost);
router.get('/:id', verifyToken, getPost);
router.put('/:id', verifyToken, updatePost);
router.delete('/:id', verifyToken, deletePost);

router.post('/:id/like', verifyToken, toggleLike);
router.post('/:id/repost', verifyToken, repostPost);
router.post('/:id/share', verifyToken, sharePost);
router.post('/:id/review', verifyToken, addReview);

router.post('/:id/apply', verifyToken, applyToPost);
router.get('/:id/applications', verifyToken, getPostApplications);
router.patch('/:id/applications/:applicationId/status', verifyToken, updateApplicationStatus);
router.delete('/:id/applications/:applicationId/withdraw', verifyToken, withdrawApplication);

export default router;