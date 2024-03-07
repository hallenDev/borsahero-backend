import { EntitySchema } from "typeorm";

const ContentEntity = new EntitySchema({
  name: "Content",
  tableName: "contents",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    type: {
      type: "varchar",
    },
    market: {
      type: "varchar",
    },
    title: {
      type: "varchar",
      nullable: true,
    },
    description: {
      type: "varchar",
      nullable: true,
    },
    content_type: {
      type: "varchar",
    },
    view_count: {
      type: "int",
      default: 0,
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
    files: {
      target: "Video",
      type: "many-to-many",
      joinTable: true,
      cascade: true,
    },
    user: {
      target: "User",
      type: "many-to-one",
      joinColumn: true,
    },
  },
});

export default ContentEntity;
