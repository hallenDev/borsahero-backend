import dataSource from "#root/config/ormConfig.js";
import ContentEntity from "#root/entity/Content.js";
import ReviewEntity from "#root/entity/Review.js";
import UserEntity from "#root/entity/User.js";
import { uploadFile } from "#root/utils/uploadFile.js";

const reviewRepo = dataSource.getRepository(ReviewEntity);
const userRepo = dataSource.getRepository(UserEntity);
const contentRepo = dataSource.getRepository(ContentEntity);

export const updateProfile = async (req, res) => {
  try {
    const { first_name, last_name, username, bio } = req.body;
    const user = req.user;

    const existUsername = await userRepo
      .createQueryBuilder("users")
      .where("email != :email and LOWER(username) = LOWER(:username)", {
        email: user.email,
        username,
      })
      .getOne();

    if (existUsername) {
      res.status(400).json({ msg: "Username already taken" });
    }

    user.first_name = first_name;
    user.last_name = last_name;
    user.username = username;
    user.bio = bio;

    await userRepo.save(user);
    return res.json({ user });
  } catch (error) {
    res.status(500).json({ msg: error.message || "Server Internal Error" });
  }
};

export const validateUsername = async (req, res) => {
  try {
    const { username } = req.body;

    const user = await userRepo
      .createQueryBuilder("users")
      .where("email != :email and LOWER(username) = LOWER(:username)", {
        email: req.user.email,
        username,
      })
      .getOne();

    return res.json({ status: !user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message || "Server Internal Error" });
  }
};

export const uploadProfilePhoto = async (req, res) => {
  try {
    const user = req.user;
    const file = req.file;

    const resFile = await uploadFile(
      file.filename,
      file.path,
      file.originalname
    );

    if (resFile) {
      user.avatar = resFile.Location;
      await userRepo.save(user);

      return res.json({ user });
    } else {
      return res.status(400).json({ msg: "error while avatar uploading." });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message || "Server Internal Error" });
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params || {};
    const user = await userRepo.findOne({
      where: { id },
      select: {
        id: true,
        username: true,
        first_name: true,
        last_name: true,
        bio: true,
        avatar: true,
      },
    });

    const videos = await contentRepo
      .createQueryBuilder("contents")
      .where("contents.userId = :userId", { userId: id })
      .leftJoin("contents.files", "files")
      .select("COUNT(files.id)", "totalVideos")
      .getRawOne();

    const reviewsInfo = await reviewRepo
      .createQueryBuilder("reviews")
      .where("reviews.userId = :userId", { userId: id })
      .select("COUNT(reviews.*)", "reviewsCount")
      .addSelect("SUM(reviews.rate)", "sumOfRates")
      .getRawOne();

    user.total_videos = Number(videos.totalVideos);
    user.reviews_count = Number(reviewsInfo.reviewsCount);
    user.rate =
      Number(reviewsInfo.reviewsCount) === 0
        ? 0
        : Math.round(
            (Number(reviewsInfo.sumOfRates) /
              Number(reviewsInfo.reviewsCount)) *
              10
          ) / 10;

    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const viewUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params || {};
    await userRepo
      .createQueryBuilder("users")
      .update(UserEntity)
      .where("id = :id", { id })
      .set({ view_count: () => "view_count + 1" })
      .execute();

    const user = await userRepo.findOneById(id);
    if (user) {
      res.json(user);
    } else {
      res.status(400).json({ msg: "User does not exist." });
    }
  } catch (error) {
    next(error);
  }
};
