import vaxue from "vaxue"
let put = function (requestOptions, IDBOptions = {}, processOptions = {}) {
    if (arguments.length == 0) {
        throw new Error("Failed to execute 'put': 1 argument required, but only 0 present.")
    }
    if (typeof requestOptions == "string") {
        requestOptions = {
            url: requestOptions
        }
    }
    return new Promise((resolve, reject) => {
        let request = indexedDB.open(IDBOptions.dbName || "EasyIDB", IDBOptions.version || 1);
        request.onupgradeneeded = (e) => {
            e.target.result.createObjectStore(IDBOptions.storeName || "cache");
        };
        request.onsuccess = (e) => {
            let database = e.target.result;
            try {
                var transaction = database.transaction([IDBOptions.storeName || "cache"], "readonly");
                let store = transaction.objectStore(IDBOptions.storeName || "cache");
                store.openCursor(requestOptions.url).onsuccess = async (e) => {
                    let cursor = e.target.result;
                    if (cursor) {
                        let blob = cursor.value;
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
                        let blob = await vaxue.get({
                            ...requestOptions,
                            responseType: "blob"
                        });
                        if (processOptions.processBlob) {
                            blob = await processOptions.processBlob(blob)
                        }
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
                console.error(e)
                reject(e);
            }
        }
    })
};
let get = function (url, IDBOptions = {}, processOptions = {}) {
    return new Promise((resolve, reject) => {
        let request = indexedDB.open(IDBOptions.dbName || "EasyIDB", IDBOptions.version || 1);
        request.onsuccess = (e) => {
            try {
                let database = e.target.result;
                var transaction = database.transaction([IDBOptions.storeName || "cache"], "readonly");
                let store = transaction.objectStore(IDBOptions.storeName || "cache");
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
                console.error(e)
                resolve(false)
            }
        }
    })
}
export default {
    put,
    get,
    instance: function (requestOptions, IDBOptions = {}, processOptions = {}) {
        if (typeof requestOptions == "string") {
            requestOptions = {
                url: requestOptions
            }
        }
        this.put = async (url) => {
            return await put({
                ...requestOptions,
                url
            }, IDBOptions, processOptions);
        }
        this.get = async (url) => {
            return await get({
                ...requestOptions,
                url
            }, IDBOptions, processOptions);
        }
    }
}