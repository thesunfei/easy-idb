# Easy-IDB

Makes IndexedDB storing and fetching files much easier.

## Installation

```bash
$ npm install easy-idb
```

## Quick Start

```js
import IDB from "easy-idb"

let process=async function(){
    let imageBlob1=(await IDB.put("https://example.com/images/example1.png")).blob;
    let imageBlobURL1=(await IDB.get("https://example.com/images/example1.png")).url;
    let imageBlobURL2=(await IDB.put({url:"https://example.com/images/example2.png",headers:{Authorization:"0d31eda111de"}},{dbName:'EasyIDB',storeName:'cache',version:1})).url;
    let imageBlob2=(await IDB.get("https://example.com/images/example2.png",{dbName:'EasyIDB',storeName:'cache',version:1})).blob;
}
```
# API

## IDB.put(requestOptions, IDBOptions)

The put() method of the IDB Object inserts a new record if the given item doesn't exist.
It always return a promise that resolves to an object which contains the blob object of 
the requested resource and blob URL of it if no error happened.

### requestOptions
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

## IDB.get(url, IDBOptions)
The get() method of the IDB Object only return a promise that resolves to an object which contains 
the blob object of the requested resource and blob URL of it if the 
specified resource already exsist in the database otherwise it returns false.