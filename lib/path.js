
const STARTING_SLASH_RE = /^\//;

function ensureStartingSlash(str) {
  return STARTING_SLASH_RE.test(str) ? str : '/' + str;
}

/**
 * Builds a fs absolute path
 */
exports.fsPrependPath = function (path) {
  return this.fsRootPathBuilder.prependTo(path);
};

exports.fsTruncatePath = function (path) {
  return this.fsRootPathBuilder.truncate(path);
};

exports.websitePrependPath = function (path) {
  return this.websiteRootPathBuilder ?
    this.websiteRootPathBuilder.prependTo(path) : ensureStartingSlash(path);
};

exports.websiteTruncatePath = function (path) {
  return this.websiteRootPathBuilder ?
    this.websiteRootPathBuilder.truncate(path) : ensureStartingSlash(path);
};
