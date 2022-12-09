# Easy-IDB

Makes IndexedDB storing and fetching files much easier.

## Installation

```bash
$ npm install easy-idb
```

## Quick Start

```js
import IDB from "easy-idb";

let process = async function () {
  let imageBlob1 = (await IDB.put("https://example.com/images/example1.png"))
    .blob;
  let imageBlobURL1 = (await IDB.get("https://example.com/images/example1.png"))
    .url;
  let imageBlobURL2 = (
    await IDB.put(
      {
        url: "https://example.com/images/example2.png",
        headers: { Authorization: "0d31eda111de" },
      },
      { dbName: "EasyIDB", storeName: "cache", version: 1 }
    )
  ).url;
  let imageBlob2 = (
    await IDB.get("https://example.com/images/example2.png", {
      dbName: "EasyIDB",
      storeName: "cache",
      version: 1,
    })
  ).blob;
};
```

# API

## IDB.put(requestOptions, IDBOptions, processOptions)

The put() method of the IDB Object inserts a new record if the given item doesn't exist.
It always return a promise that resolves to an object which contains the blob object of
the requested resource and blob URL of it if no error happened.
If the requested item already stored in database, a blob URL of it will be directly generated, no request to the server would be made.

### requestOptions (required)

Config options of ajax request. See
https://github.com/thesunfei/vaxue/blob/master/readme.md#config-options
for this usage.

### IDBOptions

```js
{
    dbName: "DB", //The name of the database,default:"EasyIDB"
    storeName: "store", //The name of the requested object store,default:"cache"
    version: 1 //The version of the database,default:1
}
```

### processOptions

processOptions.processBlob can be used to modify requested data.

```js
{
    processBlob: async function processSVG(blob) {//This is an example that can automatically add width and height attributes to svg
        if (!(blob.type == "image/svg+xml")) return blob;
        let svgString = await blob.text();
        let parser = new DOMParser();
        let svgDom = parser.parseFromString(svgString, "image/svg+xml").documentElement;
        let viewBox = (svgDom.getAttribute("viewBox") || "0 0 300 300").replace(/  +/g, " ").split(" ");
        let width = viewBox[2];
        let height = viewBox[3];
        svgDom.setAttribute("width", width);
        svgDom.setAttribute("height", height);
        let svgStr = svgDom.outerHTML;
        return new Blob([svgStr], {
            type: "image/svg+xml"
        })
    },
    verifySize: false//If true,put() method will send an ajax request which method is "head" everytime to check whether the file size changed,if so the sotored object will be renewed.Default is false
}
```

## IDB.get(url, IDBOptions, processOptions)

The get() method of the IDB Object only return a promise that resolves to an object which contains
the blob object of the requested resource and blob URL of it if the
specified resource already exsist in the database otherwise it returns false.

## IDB.instance(requestOptions, IDBOptions, processOptions)

```js
let IDBInstance = new IDB.instance(
  { headers: { Authorization: "0d31eda111de" } },
  { dbName: "EasyIDB", storeName: "cache", version: 1 },
  {
    processBlob: function (blob) {
      return blob;
    },
  }
);
IDBInstance.put("/example.svg").then((res) => {
  console.log(res.url, res.blob);
});
```
