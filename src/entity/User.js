import { EntitySchema } from "typeorm";

const UserEntity = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    email: {
      type: "varchar",
    },
    username: {
      type: "varchar",
      nullable: true,
    },
    password: {
      type: "varchar",
    },
    first_name: {
      type: "varchar",
      nullable: true,
    },
    last_name: {
      type: "varchar",
      nullable: true,
    },
    bio: {
      type: "varchar",
      nullable: true,
    },
    avatar: {
      type: "varchar",
      nullable: true,
    },
    view_count: {
      type: "int",
      default: 0,
    },
    stripe_customer_id: {
      type: "varchar",
      nullable: true,
    },
    stripe_account_id: {
      type: "varchar",
      nullable: true,
    },
    blocked: {
      type: "boolean",
      default: false,
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
});

export default UserEntity;
