import { EntitySchema } from "typeorm";

const StreamEntity = new EntitySchema({
  name: "Stream",
  tableName: "stream",
  columns: {
    id: {
      primary: true,
      type: "varchar",
    },
    cover_url: {
      type: "varchar",
      nullable: true,
    },
    cover_s3_key: {
      type: "varchar",
      nullable: true,
    },
    title: {
      type: "varchar",
    },
    type: {
      type: "varchar",
    },
    market: {
      type: "varchar",
    },
    description: {
      type: "varchar",
    },
    streamkey_value: {
      type: "varchar",
    },
    streamkey_arn: {
      type: "varchar",
    },
    ingest_endpoint: {
      type: "varchar",
    },
    playback_url: {
      type: "varchar",
      nullable: true,
    },
    chatroom_arn: {
      type: "varchar",
    },
    created_at: {
      type: "timestamp with time zone",
      createDate: true,
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

export default StreamEntity;
