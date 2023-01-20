migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("xh8xaerqhzt2t9o")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "zurjkplk",
    "name": "location",
    "type": "json",
    "required": true,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("xh8xaerqhzt2t9o")

  // remove
  collection.schema.removeField("zurjkplk")

  return dao.saveCollection(collection)
})
