import { Response } from 'express';
import { dbStore, IComplaint } from '../db/store.js';
import { AuthRequest } from '../middleware/auth.js';

export const createComplaint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const userName = req.user?.name || 'User';
    const userRole = req.user?.role || 'customer';
    const { bookingId, subject, description } = req.body;

    if (!subject || !description) {
      res.status(400).json({ success: false, message: 'Subject and description are required.' });
      return;
    }

    const complaint: IComplaint = {
      _id: 'cmp_' + Date.now(),
      userId: userId || '',
      userName,
      userRole,
      bookingId: bookingId || '',
      subject,
      description,
      status: 'open',
      adminResponse: '',
      createdAt: new Date().toISOString()
    };

    dbStore.complaints.push(complaint);

    res.status(201).json({
      success: true,
      message: 'Complaint filed successfully. LocalServe support will review it shortly.',
      data: complaint
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserComplaints = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const complaints = dbStore.complaints.filter(c => c.userId === userId);
    complaints.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ success: true, data: complaints });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllComplaints = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const list = [...dbStore.complaints];
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ success: true, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateComplaintStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    const complaint = dbStore.complaints.find(c => c._id === id);
    if (!complaint) {
      res.status(404).json({ success: false, message: 'Complaint not found.' });
      return;
    }

    if (status) complaint.status = status;
    if (adminResponse !== undefined) complaint.adminResponse = adminResponse;

    // Send notification to user
    dbStore.notifications.push({
      _id: 'notif_' + Date.now(),
      userId: complaint.userId,
      title: `Complaint Update: ${complaint.subject}`,
      message: `Your complaint status is now ${complaint.status}. ${adminResponse ? `Response: ${adminResponse}` : ''}`,
      type: 'complaint_update',
      isRead: false,
      link: '/complaints',
      createdAt: new Date().toISOString()
    });

    res.json({ success: true, message: 'Complaint updated.', data: complaint });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
