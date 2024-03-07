import jwt from "jsonwebtoken";
import dataSource from "#root/config/ormConfig.js";
import UserEntity from "#root/entity/User.js";
import { jwtConfig } from "#root/config/jwtConfig.js";

const userRepo = dataSource.getRepository(UserEntity);

export default () => async (req, res, next) => {
  try {
    let token = "";
    const field = req && req.headers.authorization;

    if (field && field.startsWith("Bearer ")) {
      token = field.slice(7);
    } else {
      return res.status(403).send("Not a valid JWT token");
    }

    // validate jwt token
    const resData = jwt.verify(token, jwtConfig.SECRET, jwtConfig.option);
    const { email } = resData;

    const user = await userRepo.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (!user) {
      return res
        .status(403)
        .json({ msg: "Your session was invalid or expired." });
    }
    req.user = user;

    next();
  } catch (error) {
    return res
      .status(403)
      .json({ msg: "Your session was invalid or expired." });
  }
};
