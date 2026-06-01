import mongoose from 'mongoose';
import { TOKEN_TYPES } from '../utils/constants.js';

const tokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [TOKEN_TYPES.EMAIL_VERIFICATION, TOKEN_TYPES.PASSWORD_RESET],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

tokenSchema.index({ token: 1, type: 1 });

const Token = mongoose.model('Token', tokenSchema);

export default Token;
