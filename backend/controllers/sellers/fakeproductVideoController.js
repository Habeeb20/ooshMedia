import ProductVideo from "../../models/sellers/fakeproductVideo.js"
import cloudinary from "../../utills/cloudinary.js";
/**
 * @swagger
 * /api/product-videos:
 *   post:
 *     summary: Seller uploads a product video (Cloudinary URL already generated client-side)
 *     tags: [ProductVideo]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [url, publicId, description]
 *             properties:
 *               url: { type: string }
 *               publicId: { type: string }
 *               duration: { type: number, nullable: true }
 *               format: { type: string, nullable: true }
 *               thumbnailUrl: { type: string, nullable: true }
 *               thumbnailPublicId: { type: string, nullable: true }
 *               description: { type: string }
 *               productId: { type: string, nullable: true }
 *               tags:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       201:
 *         description: Video post created
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
export const createProductVideo = async (req, res) => {
  try {
    const sellerId = req.user.id || req.user._id;
    const {
      url,
      publicId,
      duration,
      format,
      thumbnailUrl,
      thumbnailPublicId,
      description,
      productId,
      tags,
    } = req.body;

    if (!url || !publicId) {
      return res.status(400).json({ success: false, message: 'video url and publicId are required' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: 'description is required' });
    }

    const video = await ProductVideo.create({
      seller: sellerId,
      product: productId || undefined,
      video: {
        url,
        publicId,
        duration,
        format,
        platform: 'cloudinary',
      },
      thumbnail: thumbnailUrl
        ? { url: thumbnailUrl, publicId: thumbnailPublicId }
        : undefined,
      description: description.trim(),
      tags: Array.isArray(tags) ? tags.filter(Boolean) : [],
    });

    res.status(201).json({ success: true, message: 'Video posted', video });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};



/**
 * @swagger
 * /api/product-videos/mine:
 *   get:
 *     summary: Get the logged-in seller's own uploaded videos
 *     tags: [ProductVideo]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of seller's videos
 */
export const getMyProductVideos = async (req, res) => {
  try {
    const sellerId = req.user.id || req.user._id;
    const videos = await ProductVideo.find({ seller: sellerId }).sort({ createdAt: -1 });
    res.json({ success: true, videos });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @swagger
 * /api/product-videos:
 *   get:
 *     summary: Get public feed of product videos (paginated)
 *     tags: [ProductVideo]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 4 }
 *     responses:
 *       200:
 *         description: Paginated list of active videos
 */
export const getProductVideos = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 4, 1);
    const skip = (page - 1) * limit;

    const filter = { status: 'active' };

    const [videos, total] = await Promise.all([
      ProductVideo.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('seller', 'firstName lastName username profilePicture businessProfile.businessName')
        .populate('product', 'name category price'),
      ProductVideo.countDocuments(filter),
    ]);

    res.json({
      success: true,
      videos,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + videos.length < total,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @swagger
 * /api/product-videos/{id}:
 *   patch:
 *     summary: Edit a video's description, tags, or linked product (owner only)
 *     tags: [ProductVideo]
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
 *               description: { type: string }
 *               tags:
 *                 type: array
 *                 items: { type: string }
 *               productId: { type: string, nullable: true }
 *               status: { type: string, enum: [active, hidden] }
 *     responses:
 *       200:
 *         description: Video updated
 *       403:
 *         description: Not the owner
 *       404:
 *         description: Video not found
 */
export const updateProductVideo = async (req, res) => {
  try {
    const sellerId = req.user.id || req.user._id;
    const { id } = req.params;
    const { description, tags, productId, status } = req.body;

    const video = await ProductVideo.findById(id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    if (String(video.seller) !== String(sellerId)) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this video' });
    }

    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({ success: false, message: 'Description cannot be empty' });
      }
      video.description = description.trim();
    }

    if (tags !== undefined) {
      video.tags = Array.isArray(tags) ? tags.filter(Boolean) : video.tags;
    }

    if (productId !== undefined) {
      video.product = productId || undefined;
    }

    if (status !== undefined && ['active', 'hidden'].includes(status)) {
      video.status = status;
    }

    await video.save();

    res.json({ success: true, message: 'Video updated', video });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @swagger
 * /api/product-videos/{id}:
 *   delete:
 *     summary: Delete a video (owner only) — removes DB record and Cloudinary asset
 *     tags: [ProductVideo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Video deleted
 *       403:
 *         description: Not the owner
 *       404:
 *         description: Video not found
 */
export const deleteProductVideo = async (req, res) => {
  try {
    const sellerId = req.user.id || req.user._id;
    const { id } = req.params;

    const video = await ProductVideo.findById(id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    if (String(video.seller) !== String(sellerId)) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this video' });
    }

    // best-effort Cloudinary cleanup — don't block the DB delete if this fails
    try {
      if (video.video?.publicId) {
        await cloudinary.uploader.destroy(video.video.publicId, { resource_type: 'video' });
      }
      if (video.thumbnail?.publicId) {
        await cloudinary.uploader.destroy(video.thumbnail.publicId, { resource_type: 'image' });
      }
    } catch (cloudErr) {
      console.log('Cloudinary cleanup failed:', cloudErr.message);
    }

    await video.deleteOne();

    res.json({ success: true, message: 'Video deleted' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};