import mongoose from "mongoose";
import {
  getLevelScore,
  saveLevelHistoryChanges,
  saveAchivementLevelChanges,
  sendLevelMessage
} from "../utils/levels";
import { isNewLevel } from "../utils/achievementsLevel";

export const userSchema = new mongoose.Schema({
  avatar: {
    type: String,
    required: false
  },
  name: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    required: true,
    default: 0,
    set: function(name) {
      this._previousLevel = this.level;
      return name;
    }
  },
  score: {
    type: Number,
    required: true,
    default: 0
  },
  slackId: {
    type: String,
    required: false
  },
  rocketId: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: false
  },
  messages: {
    type: Number,
    required: false,
    default: 0
  },
  replies: {
    type: Number,
    required: false,
    default: 0
  },
  reactions: {
    positives: {
      type: Number,
      required: false,
      default: 0
    },
    negatives: {
      type: Number,
      required: false,
      default: 0
    },
    others: {
      type: Number,
      required: false,
      default: 0
    }
  },
  lastUpdate: {
    type: Date,
    required: true,
    default: Date.now
  },
  isCoreTeam: {
    type: Boolean,
    required: true,
    default: false
  },
  githubId: {
    type: String,
    required: false
  },
  disqusUsername: {
    type: String,
    required: false
  },
  teams: {
    type: Array,
    required: false
  },
  linkedinId: {
    type: String,
    required: false
  }
});

userSchema.pre("save", async function(next) {
  if (this.isModified("level") && isNewLevel(this._previousLevel, this.level)) {
    await saveLevelHistoryChanges(this._id, this._previousLevel, this.level);
    const achievement = await saveAchivementLevelChanges(
      this._id,
      this._previousLevel,
      this.level
    );

    const score = getLevelScore(achievement);
    let isUpdate = score > 0;
    this.score += score;
    await sendLevelMessage(this, achievement, isUpdate);

    next();
  } else {
    next();
  }
});

export default mongoose.model("User", userSchema);
