export default {
  dataEntity: "MappUserSubscriber",
  schemaName: "mapp-user-subscriber-v1",
  schemaBody: {
    "properties": {
      userId: {
        type: "string",
        title: "User ID",
      },
      isSubscriber: {
        type: "boolean",
        title: "Newsletter status",
      },
    },
    "v-default-fields": ["id", "userId", "isSubscriber"],
    "required": ["userId", "isSubscriber"],
    "v-indexed": ["userId", "isSubscriber"],
    "v-security": {
      allowGetAll: true,
      publicRead: ["userId", "id", "isSubscriber"],
      publicWrite: ["userId", "id", "isSubscriber"],
      publicFilter: ["userId", "id", "isSubscriber"],
    },
  },
}
