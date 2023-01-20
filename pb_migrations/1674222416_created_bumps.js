migrate((db) => {
  const collection = new Collection({
    "id": "xh8xaerqhzt2t9o",
    "created": "2023-01-20 13:46:56.604Z",
    "updated": "2023-01-20 13:46:56.604Z",
    "name": "bumps",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "pjgm0jav",
        "name": "user",
        "type": "text",
        "required": true,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      }
    ],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("xh8xaerqhzt2t9o");

  return dao.deleteCollection(collection);
})
