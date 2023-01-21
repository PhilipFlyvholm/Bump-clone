migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("xh8xaerqhzt2t9o")

  collection.viewRule = ""

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("xh8xaerqhzt2t9o")

  collection.viewRule = null

  return dao.saveCollection(collection)
})
