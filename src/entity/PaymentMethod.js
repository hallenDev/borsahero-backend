import { EntitySchema } from "typeorm";

const PaymentMethodEntity = new EntitySchema({
  name: "PaymentMethod",
  tableName: "payment_methods",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    payment_id: {
      type: "varchar",
    },
    brand: {
      type: "varchar",
    },
    last4: {
      type: "varchar",
    },
    holder_name: {
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
  },
});

export default PaymentMethodEntity;
