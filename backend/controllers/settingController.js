import Settings from '../models/setting.js';

export const getSettings = async (req, res) => {
  const settings = await Settings.findOneAndUpdate(
    { key: 'global' }, {}, { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json(settings);
};

export const toggleLoyaltyUsage = async (req, res) => {
  const { enabled } = req.body;
  const settings = await Settings.findOneAndUpdate(
    { key: 'global' },
    { allowLoyaltyUsage: !!enabled },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json(settings);
};