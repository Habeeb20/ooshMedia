import Category from '../models/Category.js';

const toSlug = (str) => str.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const createCategory = async (req, res) => {
  try {
    const { name, icon, description } = req.body;
    const category = await Category.create({ name, slug: toSlug(name), icon, description });
    res.status(201).json({ success: true, category });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const addSubcategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name } = req.body;
    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    category.subcategories.push({ name, slug: toSlug(name) });
    await category.save();
    res.status(201).json({ success: true, category });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('name');
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.name) updates.slug = toSlug(updates.name);
    const category = await Category.findByIdAndUpdate(req.params.categoryId, updates, { new: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, category });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteSubcategory = async (req, res) => {
  try {
    const { categoryId, subcategoryId } = req.params;
    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    category.subcategories.id(subcategoryId)?.deleteOne();
    await category.save();
    res.json({ success: true, category });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.categoryId);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};