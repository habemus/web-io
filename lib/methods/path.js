// constants
const STARTING_SLASH_RE = /^\//;

function ensureStartingSlash(str) {
  return STARTING_SLASH_RE.test(str) ? str : '/' + str;
}

/**
 * Prepends the fsRoot to the given path
 * 
 * @param {String} path
 * @return {String}
 */
exports.prependFsRoot = function (path) {
  return this.fsRootPathBuilder.prependTo(path);
};

/**
 * Truncates the fsRoot from the given path.
 * Throws error in case the path is outside the fsRoot
 * 
 * @param {String} path
 * @return {String}
 */
exports.truncateFsRoot = function (path) {
  return this.fsRootPathBuilder.truncate(path);
};

/**
 * Prepends the websiteRoot path to the given path
 * 
 * @param {String} path
 * @return {String}
 */
exports.prependWebsiteRoot = function (path) {
  return this.websiteRootPathBuilder ?
    this.websiteRootPathBuilder.prependTo(path) : ensureStartingSlash(path);
};

/**
 * Truncates the websiteRoot from the given path
 * 
 * @param {String} path
 * @return {String}
 */
exports.truncateWebsiteRoot = function (path) {
  return this.websiteRootPathBuilder ?
    this.websiteRootPathBuilder.truncate(path) : ensureStartingSlash(path);
};
