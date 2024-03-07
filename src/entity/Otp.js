import { EntitySchema } from "typeorm";

const OtpEntity = new EntitySchema({
  name: "Otp",
  tableName: "otps",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    email: {
      type: "varchar",
    },
    password: {
      type: "varchar",
      nullable: true,
    },
    code: {
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
});

export default OtpEntity;
