import otpGenerator from "otp-generator";
import jwt from "jsonwebtoken";
import dataSource from "#root/config/ormConfig.js";
import UserEntity from "#root/entity/User.js";
import OtpEntity from "#root/entity/Otp.js";
import { sendMail } from "#root/utils/mailSender.js";
import { encode, verifyText } from "#root/utils/encoder.js";
import { jwtConfig } from "#root/config/jwtConfig.js";

const userRepo = dataSource.getRepository(UserEntity);
const otpRepo = dataSource.getRepository(OtpEntity);

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // validate mail (if already registered)
    const user = await userRepo.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (user) {
      return res.status(400).json({ msg: "Email is already registered." });
    }

    //encrypt password
    const password_enc = await encode(password);

    // generate OTP code
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // send mail using aws ses
    const mailSent = await sendMail(
      email,
      "BORSA HERO - Confirm your email address",
      "We sent verification code to your mail",
      `<html>code: ${otp}</html>`
    );
    if (!mailSent) {
      return res
        .status(401)
        .json({ msg: "Error while sending code to your email." });
    }

    // create/update new record on otp table
    const exist = await otpRepo.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (exist) {
      exist.password = password_enc;
      exist.code = otp;
      await otpRepo.save(exist);
    } else {
      const entity = {
        email: email.toLowerCase(),
        password: password_enc,
        code: otp,
      };

      await otpRepo.save(entity);
    }
    return res.json({ status: "success" });
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message || "Server Internal Error");
  }
};

export const registerOTP = async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    if (otpCode === "") {
      return res.status(400).json({ msg: "Incorrect code, please try again." });
    }

    const existUser = await userRepo.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (existUser) {
      return res.status(400).json({ msg: "Email is already registered." });
    }
    // check if otp code is valid
    const otpData = await otpRepo.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (!otpData) {
      return res.status(400).json({ msg: "Incorrect code, please try again." });
    }

    if (otpData.code !== otpCode) {
      return res.status(400).json({ msg: "Incorrect code, please try again" });
    }

    // validate expiration
    const currentTimestamp = new Date().getTime();
    const compareTime = new Date(currentTimestamp - 15 * 60 * 1000);

    if (compareTime > otpData.updated_at) {
      return res.status(400).json({ msg: "Code expired, please resend code" });
    }

    // add to user table
    const user = {
      email: email.toLowerCase(),
      password: otpData.password,
    };
    const userObj = await userRepo.save(user);

    // delete current otpData
    await otpRepo
      .createQueryBuilder("otp")
      .where("email=:email", { email: email.toLowerCase() })
      .delete()
      .execute();

    // create & return jwt token
    const accessToken = jwt.sign(
      { email: email.toLowerCase() },
      jwtConfig.SECRET,
      jwtConfig.option
    );
    const userData = {
      id: userObj.id,
      email: email.toLowerCase(),
      accessToken: accessToken,
    };

    return res.json({ user: userData });
  } catch (error) {
    res.status(500).json(error.message || "Server Internal Error");
  }
};

export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // check if mail is exist and valid(not blocked)
    const user = await userRepo.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ msg: "We couldn't find the user with this email." });
    }

    if (user.blocked) {
      return res.status(402).json({
        msg: `Seems like you've been blocked by an Admin. If you think there is a mistake, please contact support@borsahero.com`,
      });
    }

    //compare password
    const passwordMatched = await verifyText(password, user.password);
    if (!passwordMatched) {
      return res
        .status(401)
        .json({ msg: "Incorrect password. It happens to the best of us." });
    }

    // create & return jwt token
    const accessToken = jwt.sign(
      { email: email.toLowerCase() },
      jwtConfig.SECRET,
      jwtConfig.option
    );

    const userData = {
      id: user.id,
      email: user.email,
      avatar: user.avatar,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      bio: user.bio,
      accessToken: accessToken,
    };

    return res.json({ user: userData });
  } catch (error) {
    res.status(500).json(error.message || "Server Internal Error");
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, password, otpCode } = req.body;

    // check if otp code is valid
    const otpData = await otpRepo.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (!otpData) {
      return res.status(400).json({ msg: "Something went wrong." });
    }

    if (otpData.code !== otpCode) {
      return res.status(400).json({ msg: "Something went wrong." });
    }

    // get user data
    const userRepo = dataSource.getRepository(UserEntity);
    const user = await userRepo.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });

    // update password
    const password_enc = await encode(password);
    user.password = password_enc;
    await userRepo.save(user);

    // delete current otpData
    await otpRepo
      .createQueryBuilder("otp")
      .where("email=:email", { email: email.toLowerCase() })
      .delete()
      .execute();

    return res.json({ status: "success" });
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message || "Server Internal Error");
  }
};

export const resetPassOTP = async (req, res, next) => {
  try {
    const { email, otpCode } = req.body;

    if (otpCode == "") {
      return res.status(400).json({ msg: "Incorrect code, please try again." });
    }
    // check if otp code is valid
    const otpData = await otpRepo.findOne({
      where: {
        code: otpCode,
      },
    });

    if (!otpData) {
      return res.status(400).json({ msg: "Incorrect code, please try again." });
    }

    if (otpData.email !== email.toLowerCase()) {
      return res.status(400).json({ msg: "Incorrect code, please try again" });
    }

    // validate expiration
    const currentTimestamp = new Date().getTime();
    const compareTime = new Date(currentTimestamp - 15 * 60 * 1000);

    if (compareTime > otpData.updated_at) {
      return res.status(400).json({ msg: "Incorrect code, please try again" });
    }

    return res.json({ status: "success" });
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message || "Server Internal Error");
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // check if mail is exist or valid
    const user = await userRepo.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (!user) {
      return res.status(400).json({ msg: "This email is not yet registered." });
    }

    // no need to check if blocked?

    // generate otp
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // send mail
    const mailSent = await sendMail(
      email,
      "BORSA HERO - Forgot your password?",
      "We sent verification code to reset password",
      `<html>code: ${otp}</html>`
    );
    if (!mailSent) {
      return res
        .status(401)
        .json({ msg: "Error while sending code to your mail." });
    }

    // create/update otp table
    const otpData = await otpRepo.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (otpData) {
      otpData.code = otp;
      await otpRepo.save(otpData);
    } else {
      await otpRepo.save({
        email: email.toLowerCase(),
        code: otp,
      });
    }

    return res.json({ status: "success" });
  } catch (error) {
    res.status(500).json(error.message || "Server Internal Error");
  }
};

export const logout = async (req, res, next) => {
  try {
  } catch (error) {}
};
