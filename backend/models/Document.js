
import mongoose from 'mongoose';

const { Schema } = mongoose;

const documentSchema = new Schema(
	{
		user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		title: { type: String, required: true, trim: true },
		originalName: { type: String, default: '' },
		path: { type: String, default: '' },
		mimeType: { type: String, default: '' },
		size: { type: Number, default: 0 },
		text: { type: String, default: '' },
		chunks: { type: [Schema.Types.Mixed], default: [] },
		metadata: { type: Schema.Types.Mixed, default: {} },
		processed: { type: Boolean, default: false },

		// Additional tracking fields
		uploadDate: { type: Date, default: Date.now },
		lastAccessed: { type: Date, default: null },
		status: { type: String, enum: ['pending', 'processed', 'failed'], default: 'processing' },
	},
	{ timestamps: true }
);

documentSchema.index({ user: 1, createdAt: -1 });

const Document = mongoose.model('Document', documentSchema);

export default Document;

