import * as mongoose from 'mongoose';

export const NotificationSchema = new mongoose.Schema({
  recipient: String,
  userId: String,
  action: String,
  note: {
    type: { username: String, title: String },
  },
  seen : {
    type: Boolean,
    default: false,
  },
}, { timestamps: true, id: true });
