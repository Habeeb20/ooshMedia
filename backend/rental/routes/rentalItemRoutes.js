import express from 'express';
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  toggleLike,
  registerShare,
  checkAvailability,
  getMyItems,
} from '../controllers/rentalController.js';
import { verifyToken } from '../../middleware/verifyToken.js';


const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: RentalItems
 *   description: Items listed for rent
 */

/**
 * @swagger
 * /api/rentals/items:
 *   post:
 *     summary: List a new item for rent
 *     tags: [RentalItems]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, category, subcategory, images, rate]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               category: { type: string, description: Category ObjectId }
 *               subcategory: { type: string, description: Subcategory sub-document id }
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties: { url: { type: string }, publicId: { type: string } }
 *               videos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties: { url: { type: string }, publicId: { type: string } }
 *               rate:
 *                 type: object
 *                 properties:
 *                   amount: { type: number }
 *                   unit: { type: string, enum: [hour, day, week, month] }
 *               depositAmount: { type: number }
 *               pickupLocation:
 *                 type: object
 *                 properties:
 *                   address: { type: string }
 *                   city: { type: string }
 *                   area: { type: string }
 *               deliveryAvailable: { type: boolean }
 *               deliveryFee: { type: number }
 *     responses:
 *       201: { description: Item created }
 *       402: { description: Not enough video-upload credits }
 *   get:
 *     summary: Search/list active rental items
 *     tags: [RentalItems]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: subcategory
 *         schema: { type: string }
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *         description: Only return items free for this start date
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *         description: Only return items free until this end date
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of items }
 */
router.post('/', verifyToken, createItem);
router.get('/', getItems);

router.get('/mine', verifyToken, getMyItems);

/**
 * @swagger
 * /api/rentals/items/{itemId}:
 *   get:
 *     summary: Get a single item (increments view count)
 *     tags: [RentalItems]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Item details }
 *       404: { description: Item not found }
 *   put:
 *     summary: Update an item (owner only)
 *     tags: [RentalItems]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Item updated }
 *   delete:
 *     summary: Delete an item (owner only)
 *     tags: [RentalItems]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Item deleted }
 */
router.get('/:itemId', getItemById);
router.put('/:itemId', verifyToken, updateItem);
router.delete('/:itemId', verifyToken, deleteItem);

/**
 * @swagger
 * /api/rentals/items/{itemId}/like:
 *   post:
 *     summary: Toggle like on an item
 *     tags: [RentalItems]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Like toggled }
 */
router.post('/:itemId/like', verifyToken, toggleLike);

/**
 * @swagger
 * /api/rentals/items/{itemId}/share:
 *   post:
 *     summary: Register a share on an item
 *     tags: [RentalItems]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Share counted }
 */
router.post('/:itemId/share', registerShare);

/**
 * @swagger
 * /api/rentals/items/{itemId}/availability:
 *   get:
 *     summary: Check whether an item is free for a given date range
 *     tags: [RentalItems]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: from
 *         required: true
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         required: true
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Availability result }
 */
router.get('/:itemId/availability', checkAvailability);

export default router;