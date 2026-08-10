import Report from '../models/report.js';
import User from '../models/user.js';
// POST /api/reports  (auth required)
export const createReport = async (req, res) => {
  try {
    const { reportedSellerId, reason, otherReason, description, incidentDate, relatedProductId } = req.body;

    if (!reportedSellerId || !reason || !description) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    if (reportedSellerId === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You cannot report yourself' });
    }
    if (reason === 'Other' && !otherReason?.trim()) {
      return res.status(400).json({ success: false, message: 'Please describe the reason' });
    }

    const seller = await User.findById(reportedSellerId);
    if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });

    const report = await Report.create({
      reporter: req.user._id,
      reportedSeller: reportedSellerId,
      reason,
      otherReason: reason === 'Other' ? otherReason.trim() : undefined,
      description: description.trim(),
      incidentDate: incidentDate || undefined,
      relatedProduct: relatedProductId || undefined,
    });

    res.status(201).json({ success: true, report });
  } catch (err) {
    console.error('createReport error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit report' });
  }
};

// GET /api/admin/reports?status=&page=&limit=  (admin)
export const getReports = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .populate('reporter', 'firstName lastName username email phoneNumber profilePicture')
        .populate('reportedSeller', 'firstName lastName username email phoneNumber businessProfile.businessName isBlacklisted')
        .populate('relatedProduct', 'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Report.countDocuments(filter),
    ]);

    res.json({ success: true, reports, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('getReports error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch reports' });
  }
};

// GET /api/admin/reports/:id  (admin)
export const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reporter', 'firstName lastName username email phoneNumber profilePicture state lga')
      .populate('reportedSeller', 'firstName lastName username email phoneNumber businessProfile isBlacklisted blacklist')
      .populate('relatedProduct', 'name images')
      .populate('reviewedBy', 'firstName lastName username');

    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    // How many total reports exist against this seller, for admin context
    const totalAgainstSeller = await Report.countDocuments({ reportedSeller: report.reportedSeller._id });

    res.json({ success: true, report, totalAgainstSeller });
  } catch (err) {
    console.error('getReportById error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch report' });
  }
};

// PATCH /api/admin/reports/:id  (admin)  body: { status, adminNotes }
export const updateReportStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        ...(status && { status }),
        ...(adminNotes !== undefined && { adminNotes }),
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
      },
      { new: true }
    );
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, report });
  } catch (err) {
    console.error('updateReportStatus error:', err);
    res.status(500).json({ success: false, message: 'Failed to update report' });
  }
};