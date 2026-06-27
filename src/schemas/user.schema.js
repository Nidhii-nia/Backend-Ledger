const Mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new Mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required to create an account."],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
        "Provide a valid email",
      ],
      unique: [true, "Email already exists!"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password should contain atleast 8 characters"],
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
  return;
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const userModel = Mongoose.model("user", userSchema);

module.exports = userModel;
