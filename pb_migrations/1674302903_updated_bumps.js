migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("xh8xaerqhzt2t9o")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ycqtmevs",
    "name": "matched_with",
    "type": "text",
    "required": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("xh8xaerqhzt2t9o")

  // remove
  collection.schema.removeField("ycqtmevs")

  return dao.saveCollection(collection)
})
