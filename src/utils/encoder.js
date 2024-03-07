import bcrypt from "bcrypt";

export const encode = async (text) => {
  try {
    const saltRounds = parseInt(process.env.SALT_ROUNDS || "10");
    const salt = await bcrypt.genSalt(saltRounds);
    const res = await bcrypt.hash(text, salt);
    return res;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const verifyText = async (text, hash) => {
  return await bcrypt.compare(text, hash);
};
