const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// A Schema defines the SHAPE of documents in a collection
// Think of it like a form template - every user must have these fields
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,  // this field cannot be empty
      trim: true,      // removes accidental spaces: "  Ali  " → "Ali"
    },
    email: {
      type: String,
      required: true,
      unique: true,    // no two users can have same email
      lowercase: true, // "Ali@Gmail.com" → "ali@gmail.com"
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    bio: {
      type: String,
      default: '',     // if not provided, saves empty string
      maxlength: 500,
    },
    skills: [String],  // an array of strings e.g. ["React", "Node"]
    role: {
      type: String,
      enum: ['user', 'admin'], // only these two values are allowed
      default: 'user',
    },
  },
  {
    timestamps: true, // auto-adds createdAt and updatedAt fields
  }
);

// ─── MIDDLEWARE (runs automatically before saving) ───────────────────────────
// This function runs every time we call user.save()
// "pre" means BEFORE the save happens
userSchema.pre('save', async function () {
  // "this" refers to the user document being saved

  // IMPORTANT: only hash if password was actually changed
  // Without this check, the password would get hashed AGAIN on every save
  if (!this.isModified('password')) return ;

  // bcrypt.genSalt(10) creates a random string (salt) - makes hashing unique
  // 10 is the "cost factor" - higher = more secure but slower
  const salt = await bcrypt.genSalt(10);

  // Replace the plain text password with the hashed version
  // e.g. "mypassword123" → "$2a$10$xyz..."
  this.password = await bcrypt.hash(this.password, salt);

   // tell mongoose to continue saving
});

// ─── INSTANCE METHODS ────────────────────────────────────────────────────────
// Methods we can call on any user document

// Compares a plain text password with the stored hash
// bcrypt.compare handles the hashing automatically
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Returns user data WITHOUT the password field
// We never want to accidentally send the password back to the frontend
userSchema.methods.getPublicProfile = function () {
  const user = this.toObject(); // convert mongoose document to plain JS object
  delete user.password;         // remove the password field
  delete user.__v;              // remove mongoose's internal version field
  return user;
};

// Create and export the model
// mongoose.model('User', userSchema) creates a 'users' collection in MongoDB
module.exports = mongoose.model('User', userSchema);