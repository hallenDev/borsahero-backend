import dataSource from "#root/config/ormConfig.js";
import ContentEntity from "#root/entity/Content.js";
import SubscriptionEntity from "#root/entity/Subscription.js";
import { PROFILE } from "#root/entity/Subscription.js";

const contentRepo = dataSource.getRepository(ContentEntity);
const subscriptionRepo = dataSource.getRepository(SubscriptionEntity);

export const getPopularPlaylists = async (req, res, next) => {
  try {
    const subscriptions = await subscriptionRepo.find({
      where: {
        type: PROFILE,
        user: {
          id: req.user.id,
        },
      },
      select: {
        ended_at: true,
        profileUser: {
          id: true,
        },
      },
      relations: {
        profileUser: true,
      },
    });

    const contents = await contentRepo.find({
      where: {
        type: "playlist",
      },
      relations: {
        files: true,
        user: true,
      },
      order: {
        view_count: "DESC",
      },
      take: 10,
      skip: 0,
    });

    for (let i = 0; i < contents.length; i++) {
      const content = contents[i];

      let shouldSubscribe =
        content?.content_type === "paid" && content?.user?.id !== req.user.id;
      const subscription = subscriptions.find(
        (s) => s?.profileUser?.id === content?.user?.id
      );

      if (subscription && Number(subscription.ended_at) * 1000 > Date.now()) {
        shouldSubscribe = false;
      }

      content.shouldSubscribe = shouldSubscribe;
    }
    res.json(contents);
  } catch (error) {
    next(error);
  }
};
