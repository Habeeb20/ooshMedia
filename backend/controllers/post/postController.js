
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

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a post, contract listing, or supply request
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePostRequest'
 *     responses:
 *       201:
 *         description: Post created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Post' }
 *       400:
 *         description: Content is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

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


/**
 * @swagger
 * /api/posts/feed:
 *   get:
 *     summary: Get the paginated post feed
 *     description: Results are cached for 60 seconds per postType/category/page/limit combination.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: postType
 *         schema: { type: string, enum: [post, contract, supply] }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Feed page
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 fromCache: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Post' }
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     total: { type: integer }
 *                     pages: { type: integer }
 */


// ====================== GET FEED ======================
export const getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10, postType, category } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const cacheKey = `feed_${postType}_${category}_${page}_${limit}`;

    const cached = cache.get(cacheKey);
    if (cached) return res.status(200).json({ success: true, ...cached, fromCache: true });

    const filter = { };
    // const filter = { status: 'active' };
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

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get a single post by ID
 *     description: Increments the post's view count on every read.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Post found, with author, original post, reviews, and applications populated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Post' }
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Update a post
 *     description: Only the author can update. Only whitelisted fields are applied.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePostRequest'
 *     responses:
 *       200:
 *         description: Post updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Post' }
 *       403:
 *         description: Not the author
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Post deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *       403:
 *         description: Not the author
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */


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

/**
 * @swagger
 * /api/posts/{id}/like:
 *   post:
 *     summary: Toggle a like on a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Like toggled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 liked: { type: boolean }
 *                 likeCount: { type: integer }
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

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

/**
 * @swagger
 * /api/posts/{id}/repost:
 *   post:
 *     summary: Repost an existing post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               repostComment: { type: string }
 *     responses:
 *       201:
 *         description: Repost created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Post' }
 *       400:
 *         description: Already reposted this post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Original post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

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

/**
 * @swagger
 * /api/posts/{id}/share:
 *   post:
 *     summary: Record a share on a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Share recorded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 */

// ====================== SHARE ======================
export const sharePost = async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, { $inc: { shares: 1 } });
    res.status(200).json({ success: true, message: 'Share recorded' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @swagger
 * /api/posts/{id}/review:
 *   post:
 *     summary: Add a 1–5 star review with an optional comment
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating]
 *             properties:
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *     responses:
 *       201:
 *         description: Review added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Review' }
 *       400:
 *         description: Invalid rating, or already reviewed this post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */


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

/**
 * @swagger
 * /api/posts/{id}/apply:
 *   post:
 *     summary: Apply to a contract or supply post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApplyToPostRequest'
 *     responses:
 *       201:
 *         description: Application submitted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *       400:
 *         description: Wrong post type, own post, post closed, or already applied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

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

/**
 * @swagger
 * /api/posts/my-applications:
 *   get:
 *     summary: Get posts I've applied to, alongside my own application on each
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: List of { post, application } pairs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       post: { $ref: '#/components/schemas/Post' }
 *                       application: { $ref: '#/components/schemas/Application' }
 */

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


/**
 * @swagger
 * /api/posts/{id}/applications:
 *   get:
 *     summary: Post owner — get all applications received on a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Applications with applicant profile populated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Application' }
 *       403:
 *         description: Not the post owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

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


/**
 * @swagger
 * /api/posts/{id}/applications/{applicationId}/status:
 *   put:
 *     summary: Post owner — update an application's status
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, accepted, rejected, shortlisted]
 *     responses:
 *       200:
 *         description: Application status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Application' }
 *       400:
 *         description: Invalid status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Not the post owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Post or application not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

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

/**
 * @swagger
 * /api/posts/{id}/applications/{applicationId}/withdraw:
 *   delete:
 *     summary: Applicant — withdraw my own application
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Application withdrawn
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *       403:
 *         description: Not the applicant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Post or application not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

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

/**
 * @swagger
 * /api/posts/user/{userId}:
 *   get:
 *     summary: Get a specific user's posts
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated list of the user's non-draft posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Post' }
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     total: { type: integer }
 *                     pages: { type: integer }
 *
 * /api/posts/my-posts:
 *   get:
 *     summary: Get the authenticated user's own posts
 *     description: Uses the same handler as GET /api/posts/user/{userId}, defaulting userId to req.user._id.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated list of my non-draft posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Post' }
 */
// ====================== GET USER POSTS ======================


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



/**
 * @swagger
 * /api/posts/{id}/finalize:
 *   put:
 *     summary: Toggle a post between active and closed
 *     description: Draft posts must be published (status changed to active) before they can be closed.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Post status toggled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Post' }
 *       400:
 *         description: Post is still a draft
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Not the author
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */


export const finalizePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Switch: active <-> closed. Drafts are left alone — publish first.
    if (post.status === 'draft') {
      return res.status(400).json({ success: false, message: 'Draft posts must be published before they can be closed' });
    }

    post.status = post.status === 'closed' ? 'active' : 'closed';
    await post.save();

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};















































