import { EntitySchema } from "typeorm";

const ReviewEntity = new EntitySchema({
  name: "Review",
  tableName: "reviews",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    rate: {
      type: "float",
    },
    review: {
      type: "varchar",
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
    ratedByUser: {
      target: "User",
      type: "many-to-one",
      joinColumn: true,
    },
  },
});

export default ReviewEntity;
