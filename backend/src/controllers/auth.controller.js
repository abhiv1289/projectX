import User from "../models/user.model.js";
export const register = async (req, res) => {
  const { fullname, username, email, password } = req.body;
  const user = User.findOne({ email: email });
  if (user) {
    return res.status(404).json({ message: "user already exists!" });
  }
  const newUser = new User({
    fullname,
    username,
    email,
    password,
  });

  await newUser.save();
  return res.status(200).json(newUser);
};
