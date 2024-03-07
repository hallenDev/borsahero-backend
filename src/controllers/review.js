import dataSource from "#root/config/ormConfig.js";
import ReviewEntity from "#root/entity/Review.js";
import UserEntity from "#root/entity/User.js";

const reviewRepo = dataSource.getRepository(ReviewEntity);
const userRepo = dataSource.getRepository(UserEntity);

export const getReviews = async (req, res, next) => {
  try {
    const userId = req.query.userId ? Number(req.query.userId) : req.user.id;
    const reviews = await reviewRepo.find({
      where: {
        user: {
          id: userId,
        },
      },
      relations: {
        ratedByUser: true,
      },
      order: {
        created_at: "DESC",
      },
    });

    const reviewsInfo = await reviewRepo
      .createQueryBuilder("reviews")
      .where("reviews.userId = :userId", { userId })
      .select("COUNT(reviews.*)", "reviewsCount")
      .addSelect("SUM(reviews.rate)", "sumOfRates")
      .getRawOne();

    res.json({
      reviews,
      reviews_count: Number(reviewsInfo.reviewsCount),
      rate:
        Number(reviewsInfo.reviewsCount) === 0
          ? 0
          : Math.round(
              (Number(reviewsInfo.sumOfRates) /
                Number(reviewsInfo.reviewsCount)) *
                10
            ) / 10,
    });
  } catch (error) {
    next(error);
  }
};

export const addReview = async (req, res, next) => {
  try {
    const { user_id, rate, review } = req.body;
    const user = await userRepo.findOneById(user_id);

    if (!user) {
      return res.status(400).json({ msg: "User does not exist." });
    }

    await reviewRepo.save({
      rate,
      review,
      user,
      ratedByUser: req.user,
    });

    const reviewsInfo = await reviewRepo
      .createQueryBuilder("reviews")
      .where("reviews.userId = :userId", { userId: user_id })
      .select("COUNT(reviews.*)", "reviewsCount")
      .addSelect("SUM(reviews.rate)", "sumOfRates")
      .getRawOne();

    res.json({
      reviews_count: Number(reviewsInfo.reviewsCount),
      rate:
        Number(reviewsInfo.reviewsCount) === 0
          ? 0
          : Math.round(
              (Number(reviewsInfo.sumOfRates) /
                Number(reviewsInfo.reviewsCount)) *
                10
            ) / 10,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await reviewRepo.findOne({
      where: {
        id: id,
      },
      relations: {
        user: true,
        ratedByUser: true,
      },
    });

    if (!review) {
      return res.status(400).json({ msg: "Review does not exist." });
    }

    if (review.ratedByUser.id !== req.user.id) {
      return res.status(400).json({ msg: "Permission denied." });
    }

    await reviewRepo.delete({ id });

    const reviewsInfo = await reviewRepo
      .createQueryBuilder("reviews")
      .where("reviews.userId = :userId", { userId: review.user.id })
      .select("COUNT(reviews.*)", "reviewsCount")
      .addSelect("SUM(reviews.rate)", "sumOfRates")
      .getRawOne();

    res.json({
      reviews_count: Number(reviewsInfo.reviewsCount),
      rate:
        Number(reviewsInfo.reviewsCount) === 0
          ? 0
          : Math.round(
              (Number(reviewsInfo.sumOfRates) /
                Number(reviewsInfo.reviewsCount)) *
                10
            ) / 10,
    });
  } catch (error) {
    next(error);
  }
};
