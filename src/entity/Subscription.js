import { EntitySchema } from "typeorm";

export const PLATFORM = "platform";
export const PROFILE = "profile";

const SubscriptionEntity = new EntitySchema({
  name: "Subscription",
  tableName: "subscriptions",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    subscription_id: {
      type: "varchar",
    },
    status: {
      type: "varchar",
    },
    type: {
      type: "enum",
      enum: [PLATFORM, PROFILE],
      default: PLATFORM,
    },
    ended_at: {
      type: "bigint",
      nullable: true,
    },
    is_cancelled: {
      type: "bool",
      default: false,
    },
    price: {
      type: "int",
      nullable: true,
    },
    created_at: {
      type: "timestamp with time zone",
      createDate: true,
    },
    updated_at: {
      type: "timestamp with time zone",
      updateDate: true,
    },
  },
  relations: {
    user: {
      target: "User",
      type: "many-to-one",
      joinColumn: true,
    },
    product: {
      target: "Product",
      type: "many-to-one",
      joinColumn: true,
      nullable: true,
    },
    profileUser: {
      target: "User",
      type: "many-to-one",
      joinColumn: true,
      nullable: true,
    },
  },
});

export default SubscriptionEntity;
