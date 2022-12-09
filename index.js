import vaxue from "vaxue"

function getHead(url) {
    return new Promise((resolve, reject) => {
        vaxue.ajax({
            url,
            method: "head",
            responseType: "headers"
        }).then(res => {
            resolve(res)
        }).catch(() => {
            resolve({})
        })
    })
}
let put = function (requestOptions, IDBOptions = {}, processOptions = {}) {
    if (arguments.length == 0) {
        throw new Error("Failed to execute 'put': 1 argument required, but only 0 present.")
    }
    if (typeof requestOptions == "string") {
        requestOptions = {
            url: requestOptions
        }
    }
    let dbName = IDBOptions.dbName || "EasyIDB";
    let storeName = IDBOptions.storeName || "cache";
    return new Promise((resolve, reject) => {
        let request = indexedDB.open(dbName, IDBOptions.version || 1);
        request.onupgradeneeded = (e) => {
            e.target.result.createObjectStore(storeName);
        };
        request.onsuccess = (e) => {
            let database = e.target.result;
            let ajaxGet = async (store) => {
                let blob = await vaxue.get({
                    ...requestOptions,
                    responseType: "blob"
                });
                if (processOptions.processBlob) {
                    blob = await processOptions.processBlob(blob)
                }
                transaction = database.transaction([storeName], "readwrite");
                store = transaction.objectStore(storeName);
                store.put(blob, requestOptions.url);
                resolve({
                    blob,
                    get url() {
                        return URL.createObjectURL(blob)
                    }
                });
            }
            try {
                var transaction = database.transaction([storeName], "readonly");
                let store = transaction.objectStore(storeName);
                store.openCursor(requestOptions.url).onsuccess = async (e) => {
                    let cursor = e.target.result;
                    let headData = await getHead(requestOptions.url);
                    if (cursor) {
                        let blob = cursor.value;
                        if (!processOptions.verifySize || processOptions.verifySize && headData["content-length"] == blob.size) {
                            if (processOptions.processBlob) {
                                blob = await processOptions.processBlob(blob)
                            }
                            resolve({
                                blob,
                                get url() {
                                    return URL.createObjectURL(blob)
                                }
                            });
                        } else {
                            await ajaxGet(store)
                        }
                    } else {
                        await ajaxGet(store)
                    }
                }

            } catch (e) {
                database.close();
                indexedDB.deleteDatabase(dbName);
                request = indexedDB.open(dbName, IDBOptions.version || 1);
            }
        }
    })
};
let get = function (url, IDBOptions = {}, processOptions = {}) {
    if (arguments.length == 0) {
        throw new Error("Failed to execute 'put': 1 argument required, but only 0 present.")
    }
    if (typeof url == "object") {
        url = url.url
    }
    let dbName = IDBOptions.dbName || "EasyIDB";
    let storeName = IDBOptions.storeName || "cache";
    return new Promise((resolve, reject) => {
        let request = indexedDB.open(dbName, IDBOptions.version || 1);
        request.onupgradeneeded = (e) => {
            e.target.result.createObjectStore(storeName);
        };
        request.onsuccess = (e) => {
            var database = e.target.result;
            try {
                var transaction = database.transaction([storeName], "readonly");
                let store = transaction.objectStore(storeName);
                store.get(url).onsuccess = async (e) => {
                    if (e.target.result) {
                        let blob = e.target.result;
                        if (processOptions.processBlob) {
                            blob = await processOptions.processBlob(blob)
                        }
                        resolve({
                            blob,
                            get url() {
                                return URL.createObjectURL(e.target.result)
                            }
                        });
                    } else {
                        resolve(false)
                    }
                }
            } catch (e) {
                console.warn(e)
                resolve(false)
            }
        }
    })
}
export default {
    put,
    get,
    instance: function (requestOptions, IDBOptions = {}, processOptions = {}) {
        if (arguments.length == 0) {
            throw new Error("Failed to execute 'put': 1 argument required, but only 0 present.")
        }
        if (typeof requestOptions == "string") {
            requestOptions = {
                url: requestOptions
            }
        }
        this.put = async (url = "") => {
            if (typeof url == "string") {
                url = {
                    url
                }
            }
            return await put({
                ...requestOptions,
                ...url
            }, IDBOptions, processOptions);
        }
        this.get = async (url = "") => {
            if (typeof url == "string") {
                url = {
                    url
                }
            }
            return await get({
                ...requestOptions,
                ...url
            }, IDBOptions, processOptions);
        }
    }
}