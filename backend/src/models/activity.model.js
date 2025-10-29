const { Schema, model } = require('mongoose');

const ActivitySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    date: { type: Date, default: () => new Date() },
    type: {
      type: String,
      enum: ['walk', 'run', 'cycle', 'strength', 'yoga', 'swim', 'other'],
      required: true,
    },
    intensity: { type: String, enum: ['light', 'moderate', 'vigorous'], default: 'moderate' },
    durationMin: { type: Number, required: true, min: 1 },
    distanceKm: { type: Number, default: 0 },
    calories: { type: Number, default: 0 },
    caloriesSource: { type: String, enum: ['auto', 'manual'], default: 'auto' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

ActivitySchema.index({ user: 1, date: -1 });

module.exports = model('Activity', ActivitySchema);