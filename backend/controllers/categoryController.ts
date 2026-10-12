import { Request, Response } from 'express';
import { dbStore, ICategory } from '../db/store.js';

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    data: dbStore.categories
  });
};

export const getCategoryBySlug = async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params;
  const category = dbStore.categories.find(c => c.slug === slug || c._id === slug);
  if (!category) {
    res.status(404).json({ success: false, message: 'Category not found.' });
    return;
  }
  res.json({ success: true, data: category });
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  const { name, description, icon, popular } = req.body;
  if (!name) {
    res.status(400).json({ success: false, message: 'Category name is required.' });
    return;
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const newCat: ICategory = {
    _id: 'cat_' + Date.now(),
    name,
    slug,
    description: description || '',
    icon: icon || 'Wrench',
    popular: Boolean(popular)
  };
  dbStore.categories.push(newCat);
  res.status(201).json({ success: true, data: newCat });
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description, icon, popular } = req.body;
  const cat = dbStore.categories.find(c => c._id === id);
  if (!cat) {
    res.status(404).json({ success: false, message: 'Category not found.' });
    return;
  }
  if (name) cat.name = name;
  if (description !== undefined) cat.description = description;
  if (icon) cat.icon = icon;
  if (popular !== undefined) cat.popular = Boolean(popular);

  res.json({ success: true, data: cat });
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const index = dbStore.categories.findIndex(c => c._id === id);
  if (index === -1) {
    res.status(404).json({ success: false, message: 'Category not found.' });
    return;
  }
  dbStore.categories.splice(index, 1);
  res.json({ success: true, message: 'Category deleted successfully.' });
};
