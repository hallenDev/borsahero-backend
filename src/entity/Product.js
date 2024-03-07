import { EntitySchema } from "typeorm";
import { PLATFORM, PROFILE } from "#root/entity/Subscription.js";

const ProductEntity = new EntitySchema({
  name: "Product",
  tableName: "products",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    type: {
      type: "enum",
      enum: [PLATFORM, PROFILE],
      default: PLATFORM,
    },
    stripe_product_id: {
      type: "varchar",
    },
    title: {
      type: "varchar",
    },
    description: {
      type: "varchar",
      nullable: true,
    },
    per_text: {
      type: "varchar",
      nullable: true,
    },
    price: {
      type: "integer",
    },
    currency: {
      type: "varchar",
      default: "USD",
    },
    is_active: {
      type: "bool",
      default: true,
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
      nullable: true,
    },
  },
});

export default ProductEntity;
