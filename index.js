import vaxue from "vaxue"
export default {
    put(requestOptions, IDBOptions = {}) {
        if (typeof requestOptions == "string") {
            requestOptions = {
                url: requestOptions
            }
        }
        return new Promise(async (resolve, reject) => {
            let request = indexedDB.open(IDBOptions.dbName || "EasyIDB", IDBOptions.version || 1);
            request.onupgradeneeded = (e) => {
                e.target.result.createObjectStore(IDBOptions.storeName || "cache");
            };
            request.onsuccess = function (e) {
                let database = e.target.result;
                try {
                    var transaction = database.transaction([IDBOptions.storeName || "cache"], "readonly");
                    let store = transaction.objectStore(IDBOptions.storeName || "cache");
                    store.openCursor(requestOptions.url).onsuccess = async function (e) {
                        let cursor = e.target.result;
                        if (cursor) {
                            resolve({
                                blob: cursor.value,
                                get url() {
                                    return URL.createObjectURL(cursor.value)
                                }
                            });
                        } else {
                            let blob = await vaxue.get({
                                ...requestOptions,
                                responseType: "blob"
                            });
                            transaction = database.transaction([IDBOptions.storeName || "cache"], "readwrite");
                            store = transaction.objectStore(IDBOptions.storeName || "cache");
                            store.put(blob, requestOptions.url);
                            resolve({
                                blob,
                                get url() {
                                    return URL.createObjectURL(blob)
                                }
                            });
                        }
                    }

                } catch (e) {
                    reject(e);
                }
            }
        })
    },
    get(url, IDBOptions = {}) {
        return new Promise((resolve, reject) => {
            let request = indexedDB.open(IDBOptions.dbName || "EasyIDB", IDBOptions.version || 1);
            request.onsuccess = function (e) {
                try {
                    let database = e.target.result;
                    var transaction = database.transaction([IDBOptions.storeName || "cache"], "readonly");
                    let store = transaction.objectStore(IDBOptions.storeName || "cache");
                    store.get(url).onsuccess = function (e) {
                        if (e.target.result) {
                            resolve({
                                blob: e.target.result,
                                get url() {
                                    return URL.createObjectURL(e.target.result)
                                }
                            });
                        } else {
                            resolve(false)
                        }
                    }
                } catch (e) {
                    resolve(false)
                }
            }
        })
    }
}