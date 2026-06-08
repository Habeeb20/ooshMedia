// controllers/post/postChatController.js
import PostChat from '../../models/post/chatmodel.js';
import Post from '../../models/post/post.js';

const POPULATE_USER = 'firstName lastName username profilePicture';

// GET or CREATE chat between post author and an applicant for a specific post
export const getOrCreateChat = async (req, res) => {
  try {
    const { postId, participantId } = req.params;
    const currentUserId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    // Only post author or an applicant can access chat
    const isAuthor = post.author.toString() === currentUserId.toString();
    const isApplicant = post.applications?.some(
      a => a.applicant.toString() === currentUserId.toString()
    );
    if (!isAuthor && !isApplicant) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const participants = [currentUserId.toString(), participantId].sort();

    let chat = await PostChat.findOne({
      post: postId,
      participants: { $all: participants }
    })
      .populate('participants', POPULATE_USER)
      .populate('post', 'title postType status')
      .populate('messages.sender', POPULATE_USER);

    if (!chat) {
      chat = await PostChat.create({
        post: postId,
        participants,
        messages: [],
        unreadCount: { [currentUserId.toString()]: 0, [participantId]: 0 }
      });
      chat = await chat
        .populate('participants', POPULATE_USER)
        .then(c => c.populate('post', 'title postType status'))
        .then(c => c.populate('messages.sender', POPULATE_USER));
    }

    // Mark messages as read for current user
    let updated = false;
    chat.messages.forEach(msg => {
      if (msg.sender.toString() !== currentUserId.toString() && !msg.read) {
        msg.read = true;
        msg.readAt = new Date();
        updated = true;
      }
    });
    if (updated) {
      chat.unreadCount.set(currentUserId.toString(), 0);
      await chat.save();
    }

    res.status(200).json({ success: true, data: chat });
  } catch (error) {
    console.error('getOrCreateChat error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// SEND a message
export const sendMessage = async (req, res) => {
  try {
    const { postId, participantId } = req.params;
    const { text } = req.body;
    const currentUserId = req.user._id;

    if (!text?.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    const participants = [currentUserId.toString(), participantId].sort();

    let chat = await PostChat.findOne({
      post: postId,
      participants: { $all: participants }
    });

    if (!chat) {
      chat = new PostChat({
        post: postId,
        participants,
        messages: [],
        unreadCount: {}
      });
    }

    const message = {
      sender: currentUserId,
      text: text.trim(),
      read: false,
    };

    chat.messages.push(message);
    chat.lastMessage = text.trim().slice(0, 80);
    chat.lastMessageAt = new Date();

    // Increment unread for the other participant
    const otherUserId = participantId;
    const currentUnread = chat.unreadCount.get(otherUserId) || 0;
    chat.unreadCount.set(otherUserId, currentUnread + 1);

    await chat.save();
    await chat.populate('messages.sender', POPULATE_USER);

    const newMsg = chat.messages[chat.messages.length - 1];
    res.status(201).json({ success: true, data: newMsg });
  } catch (error) {
    console.error('sendMessage error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET all chats for a post (post author view — see all applicant chats)
export const getPostChats = async (req, res) => {
  try {
    const { postId } = req.params;
    const currentUserId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author.toString() !== currentUserId.toString()) {
      return res.status(403).json({ success: false, message: 'Only post author can view all chats' });
    }

    const chats = await PostChat.find({ post: postId })
      .populate('participants', POPULATE_USER)
      .populate('post', 'title postType')
      .sort({ lastMessageAt: -1 })
      .lean();

    const enriched = chats.map(chat => ({
      ...chat,
      unreadForMe: chat.unreadCount?.[currentUserId.toString()] || 0,
      otherParticipant: chat.participants.find(p => p._id.toString() !== currentUserId.toString())
    }));

    res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET all chats the current user is part of (applicant view — across all posts they applied to)
export const getMyChats = async (req, res) => {
  try {
    const currentUserId = req.user._id.toString();

    const chats = await PostChat.find({ participants: currentUserId })
      .populate('participants', POPULATE_USER)
      .populate('post', 'title postType status author')
      .sort({ lastMessageAt: -1 })
      .lean();

    const enriched = chats.map(chat => ({
      ...chat,
      unreadForMe: chat.unreadCount?.[currentUserId] || 0,
      otherParticipant: chat.participants.find(p => p._id.toString() !== currentUserId)
    }));

    res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};