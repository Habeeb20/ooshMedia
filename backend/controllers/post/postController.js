
import Post from '../../models/post/post.js';
import User from '../../models/user.js';

import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 60 });

const POPULATE_AUTHOR = {
  path: 'author',
  select: 'firstName lastName username profilePicture businessProfile.businessName sellerProfile.shopName isSeller'
};

const POPULATE_ORIGINAL = {
  path: 'originalPost',
  populate: { path: 'author', select: 'firstName lastName username profilePicture businessProfile.businessName' }
};

// ====================== CREATE POST ======================
export const createPost = async (req, res) => {
  try {
    const {
      postType, title, content, category, subCategory, tags,
      images, budget, deadline, location, requirements, deliverables
    } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }

    const post = await Post.create({
      author: req.user._id,
      postType: postType || 'post',
      title,
      content,
      category,
      subCategory,
      tags: tags || [],
      images: images || [],
      budget,
      deadline,
      location,
      requirements: requirements || [],
      deliverables: deliverables || [],
    });

    await post.populate(POPULATE_AUTHOR);

    cache.flushAll();

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    console.error('Create Post Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ====================== GET FEED ======================
export const getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10, postType, category } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const cacheKey = `feed_${postType}_${category}_${page}_${limit}`;

    const cached = cache.get(cacheKey);
    if (cached) return res.status(200).json({ success: true, ...cached, fromCache: true });

    const filter = { status: 'active' };
    if (postType) filter.postType = postType;
    if (category) filter.category = category;

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate(POPULATE_AUTHOR)
        .populate(POPULATE_ORIGINAL)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Post.countDocuments(filter)
    ]);

    const result = {
      data: posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    };

    cache.set(cacheKey, result);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Get Feed Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ====================== GET SINGLE POST ======================
export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate(POPULATE_AUTHOR)
      .populate(POPULATE_ORIGINAL)
      .populate({ path: 'reviews.user', select: 'firstName lastName username profilePicture' })
      .populate({ path: 'applications.applicant', select: 'firstName lastName username profilePicture businessProfile sellerProfile' });

    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    // Increment views
    await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    console.error('Get Post Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ====================== UPDATE POST ======================
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const allowed = ['title', 'content', 'category', 'subCategory', 'tags', 'images',
      'budget', 'deadline', 'location', 'requirements', 'deliverables', 'status'];

    allowed.forEach(field => {
      if (req.body[field] !== undefined) post[field] = req.body[field];
    });

    await post.save();
    await post.populate(POPULATE_AUTHOR);

    cache.flushAll();
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    console.error('Update Post Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ====================== DELETE POST ======================
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await post.deleteOne();
    cache.flushAll();
    res.status(200).json({ success: true, message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ====================== LIKE / UNLIKE ======================
export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const userId = req.user._id;
    const liked = post.likes.some(id => id.toString() === userId.toString());

    if (liked) {
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
    }

    await post.save();
    cache.flushAll();
    res.status(200).json({ success: true, liked: !liked, likeCount: post.likes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ====================== REPOST ======================
export const repostPost = async (req, res) => {
  try {
    const { repostComment } = req.body;
    const originalPost = await Post.findById(req.params.id);
    if (!originalPost) return res.status(404).json({ success: false, message: 'Post not found' });

    // Check if already reposted
    const alreadyReposted = await Post.findOne({
      author: req.user._id,
      isRepost: true,
      originalPost: originalPost._id
    });
    if (alreadyReposted) {
      return res.status(400).json({ success: false, message: 'Already reposted' });
    }

    const repost = await Post.create({
      author: req.user._id,
      postType: originalPost.postType,
      content: originalPost.content,
      title: originalPost.title,
      images: originalPost.images,
      category: originalPost.category,
      isRepost: true,
      originalPost: originalPost._id,
      repostComment: repostComment || '',
    });

    // Track reposter on original
    originalPost.reposts.push(req.user._id);
    await originalPost.save();

    await repost.populate(POPULATE_AUTHOR);
    await repost.populate(POPULATE_ORIGINAL);

    cache.flushAll();
    res.status(201).json({ success: true, data: repost });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ====================== SHARE ======================
export const sharePost = async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, { $inc: { shares: 1 } });
    res.status(200).json({ success: true, message: 'Share recorded' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ====================== ADD REVIEW ======================
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const alreadyReviewed = post.reviews.some(r => r.user.toString() === req.user._id.toString());
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'Already reviewed this post' });
    }

    post.reviews.push({ user: req.user._id, rating, comment });
    await post.save();
    await post.populate({ path: 'reviews.user', select: 'firstName lastName username profilePicture' });

    res.status(201).json({ success: true, data: post.reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ====================== APPLY TO POST ======================
export const applyToPost = async (req, res) => {
  try {
    const { coverLetter, proposedPrice, attachments } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (!['contract', 'supply'].includes(post.postType)) {
      return res.status(400).json({ success: false, message: 'Can only apply to contract or supply posts' });
    }
    if (post.author.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot apply to your own post' });
    }
    if (post.status === 'closed') {
      return res.status(400).json({ success: false, message: 'This post is closed' });
    }

    const alreadyApplied = post.applications.some(
      a => a.applicant.toString() === req.user._id.toString()
    );
    if (alreadyApplied) {
      return res.status(400).json({ success: false, message: 'Already applied' });
    }

    post.applications.push({
      applicant: req.user._id,
      coverLetter,
      proposedPrice,
      attachments: attachments || []
    });
    post.applicationCount = post.applications.length;
    await post.save();

    res.status(201).json({ success: true, message: 'Application submitted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ====================== GET MY APPLICATIONS (as applicant) ======================
export const getMyApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const posts = await Post.find({
      'applications.applicant': req.user._id
    })
    .populate(POPULATE_AUTHOR)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

    const myApplications = posts.map(post => {
      const application = post.applications.find(
        a => a.applicant.toString() === req.user._id.toString()
      );
      return { post: { ...post, applications: undefined }, application };
    });

    res.status(200).json({ success: true, data: myApplications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ====================== GET APPLICATIONS FOR MY POST (as post owner) ======================
export const getPostApplications = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate({
        path: 'applications.applicant',
        select: 'firstName lastName username profilePicture businessProfile sellerProfile email phoneNumber state lga'
      });

    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.status(200).json({ success: true, data: post.applications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ====================== UPDATE APPLICATION STATUS (post owner) ======================
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id: postId, applicationId } = req.params;

    if (!['pending', 'accepted', 'rejected', 'shortlisted'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const application = post.applications.id(applicationId);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    application.status = status;
    application.updatedAt = new Date();
    await post.save();

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ====================== WITHDRAW APPLICATION (applicant) ======================
export const withdrawApplication = async (req, res) => {
  try {
    const { id: postId, applicationId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const application = post.applications.id(applicationId);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    application.deleteOne();
    post.applicationCount = post.applications.length;
    await post.save();

    res.status(200).json({ success: true, message: 'Application withdrawn' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ====================== GET USER POSTS ======================
export const getUserPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const userId = req.params.userId || req.user._id;

    const [posts, total] = await Promise.all([
      Post.find({ author: userId, status: { $ne: 'draft' } })
        .populate(POPULATE_AUTHOR)
        .populate(POPULATE_ORIGINAL)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Post.countDocuments({ author: userId, status: { $ne: 'draft' } })
    ]);

    res.status(200).json({
      success: true,
      data: posts,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};