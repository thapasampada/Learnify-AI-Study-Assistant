
import mongoose from 'mongoose';

const { Schema } = mongoose;

const messageSchema = new Schema(
	{
		sender: { type: Schema.Types.ObjectId, ref: 'User', default: null },
		role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
		content: { type: String, required: true },
		metadata: { type: Schema.Types.Mixed, default: {} },
		createdAt: { type: Date, default: Date.now },
		relevantChunks: { type: [{ type: Schema.Types.ObjectId, ref: 'Document' }], default: [] },
	},  
	{ _id: false }
);

const chatHistorySchema = new Schema(
	{
		user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		sessionId: { type: String, default: null },
		messages: { type: [messageSchema], default: [] },
		lastMessageAt: { type: Date, default: null },
		model: { type: String, default: '' },
	},
	{ timestamps: true }
);

chatHistorySchema.index({ user: 1, sessionId: 1, updatedAt: -1 });

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

export default ChatHistory;
