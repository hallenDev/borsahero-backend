import { EntitySchema } from "typeorm";

const VideoEntity = new EntitySchema({
  name: "Video",
  tableName: "videos",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    name: {
      type: "varchar",
    },
    description: {
      type: "varchar",
    },
    video_url: {
      type: "varchar",
    },
    video_s3_key: {
      type: "varchar",
    },
    poster_url: {
      type: "varchar",
    },
    poster_s3_key: {
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
    user: {
      target: "User",
      type: "many-to-one",
      joinColumn: true,
    },
  },
});

export default VideoEntity;
