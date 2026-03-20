/**
 * Server-side localStorage / sessionStorage polyfill.
 * Next.js SSR renders 'use client' components on the server where Web APIs
 * don't exist. Providers like CurrencyContext call localStorage synchronously
 * during initialization, so we provide a no-op implementation on the server.
 */
if (typeof globalThis.localStorage === 'undefined') {
  const makeStorage = () => {
    const data = {};
    return {
      getItem: (k) => (k in data ? data[k] : null),
      setItem: (k, v) => { data[k] = String(v); },
      removeItem: (k) => { delete data[k]; },
      clear: () => { for (const k in data) delete data[k]; },
      get length() { return Object.keys(data).length; },
      key: (i) => Object.keys(data)[i] ?? null,
    };
  };
  globalThis.localStorage = makeStorage();
  globalThis.sessionStorage = makeStorage();
}

/**
 * Node.js 25 + Windows workaround:
 * On this platform, fs.readlink() returns EISDIR for regular (non-symlink) files
 * instead of the expected EINVAL. Webpack's enhanced-resolve treats EINVAL as
 * "not a symlink" but crashes on EISDIR, so we convert EISDIR → EINVAL.
 */
const fs = require('fs');

const origAsync = fs.readlink.bind(fs);
fs.readlink = function patchedReadlink(path, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  origAsync(path, options, function (err, target) {
    if (err && err.code === 'EISDIR') {
      const e = new Error(`EINVAL: invalid argument, readlink '${path}'`);
      e.code = 'EINVAL';
      e.syscall = 'readlink';
      e.path = path;
      return callback(e);
    }
    callback(err, target);
  });
};

const origSync = fs.readlinkSync.bind(fs);
fs.readlinkSync = function patchedReadlinkSync(path, options) {
  try {
    return origSync(path, options);
  } catch (err) {
    if (err && err.code === 'EISDIR') {
      const e = new Error(`EINVAL: invalid argument, readlink '${path}'`);
      e.code = 'EINVAL';
      e.syscall = 'readlink';
      e.path = path;
      throw e;
    }
    throw err;
  }
};

// Also patch the promises API
if (fs.promises) {
  const origPromise = fs.promises.readlink.bind(fs.promises);
  fs.promises.readlink = async function (path, options) {
    try {
      return await origPromise(path, options);
    } catch (err) {
      if (err && err.code === 'EISDIR') {
        const e = new Error(`EINVAL: invalid argument, readlink '${path}'`);
        e.code = 'EINVAL';
        e.syscall = 'readlink';
        e.path = path;
        throw e;
      }
      throw err;
    }
  };
}
