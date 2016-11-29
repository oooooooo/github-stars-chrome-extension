// var main = (function(exports) {
  'use strict';

  var ACCESS_TOKEN = null;

  var github_star_mark = ' <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjQwcHgiIGhlaWdodD0iNDBweCIgdmlld0JveD0iMTIgMTIgNDAgNDAiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMTIgMTIgNDAgNDAiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxwYXRoIGZpbGw9IiMzMzMzMzMiIGQ9Ik0zMiAxMy40Yy0xMC41IDAtMTkgOC41LTE5IDE5YzAgOC40IDUuNSAxNS41IDEzIDE4YzEgMC4yIDEuMy0wLjQgMS4zLTAuOWMwLTAuNSAwLTEuNyAwLTMuMiBjLTUuMyAxLjEtNi40LTIuNi02LjQtMi42QzIwIDQxLjYgMTguOCA0MSAxOC44IDQxYy0xLjctMS4yIDAuMS0xLjEgMC4xLTEuMWMxLjkgMC4xIDIuOSAyIDIuOSAyYzEuNyAyLjkgNC41IDIuMSA1LjUgMS42IGMwLjItMS4yIDAuNy0yLjEgMS4yLTIuNmMtNC4yLTAuNS04LjctMi4xLTguNy05LjRjMC0yLjEgMC43LTMuNyAyLTUuMWMtMC4yLTAuNS0wLjgtMi40IDAuMi01YzAgMCAxLjYtMC41IDUuMiAyIGMxLjUtMC40IDMuMS0wLjcgNC44LTAuN2MxLjYgMCAzLjMgMC4yIDQuNyAwLjdjMy42LTIuNCA1LjItMiA1LjItMmMxIDIuNiAwLjQgNC42IDAuMiA1YzEuMiAxLjMgMiAzIDIgNS4xYzAgNy4zLTQuNSA4LjktOC43IDkuNCBjMC43IDAuNiAxLjMgMS43IDEuMyAzLjVjMCAyLjYgMCA0LjYgMCA1LjJjMCAwLjUgMC40IDEuMSAxLjMgMC45YzcuNS0yLjYgMTMtOS43IDEzLTE4LjFDNTEgMjEuOSA0Mi41IDEzLjQgMzIgMTMuNHoiLz48L3N2Zz4=" width="14px" height="14px" style="display: inline; margin: 1px;" />★'; // (c) ghbtns.com

  var expire = 1 * 60 * 60 * 1000; // ms

  var ignore_urls = [
    'organizations/new',
    'settings/profile',
    'account/organizations',
    'site/terms',
    'site/privacy'
  ];

  function add_github_stars(a, stars) {
    a.innerHTML = a.innerHTML + github_star_mark + stars;
  }

  function cached(url, stars) {
    var github = {};
    github[url] = { stars: stars, expire: Date.now() };
    chrome.storage.local.set(github, function() {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError);
        return;
      }
    });
  }

  function clear_cache() {
    chrome.storage.local.getBytesInUse(function(bytes) {
      if (is_storage_full(bytes)) {
        chrome.storage.local.clear(function () {
          if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError);
            return;
          }
        });
      }
    });
  }

  function get_and_add_github_stars(a, url) {
    chrome.storage.local.get(url, function (github) {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError);
        return;
      }

      if (!has_cached(github) || is_cached_expired(github[url])) {
        githubStars(url, ACCESS_TOKEN, function (stars) {
          cached(url, stars);
          if (has_stars(stars)) add_github_stars(a, stars);
        });
      }
      else {
        var stars = github[url].stars;
        if (has_stars(stars)) add_github_stars(a, stars);
      }
    });
  }

  function github_repository_url(a) {
    var url = a.href.match(/^https?:\/\/github.com\/([a-zA-Z0-9_\-\.]+\/[a-zA-Z0-9_\-\.]+)\/?$/);
    return url === null ? null : url[1];
  }

  function has_cached(cache) {
    return Object.keys(cache).length !== 0 ? true : false;
  }

  function has_stars(stars) {
    return !isNaN(stars) && stars !== 0 ? true : false;
  }

  function is_cached_expired(date) {
    return Date.now() - date.expire > expire;
  }

  function is_storage_full(bytes) {
    return bytes / chrome.storage.local.QUOTA_BYTES >= 0.9;
  }

  function is_github_repository(url) {
    if (url === null) return false;
    if (url.match(/^blog\/.+/) !== null) return false;
    if (url.match(/^.+\/following$/) !== null) return false;
    if (url.match(/^.+\/dummy$/) !== null) return false;
    if (ignore_urls.indexOf(url) !== -1) return false;

    return true;
  }

  // exports.run = function() {
  function run() {
    clear_cache();

    chrome.storage.local.get('access_token', function (result) {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError);
        return;
      }

      if (!result.access_token) {
        return;
      }
      ACCESS_TOKEN = result.access_token;

      var a = document.querySelectorAll('a');
      for (var i = 0; i < a.length; i++) {
        var url = github_repository_url(a[i]);
        if (!is_github_repository(url)) { continue; }
        get_and_add_github_stars(a[i], url);
      }
    });
  }

//   return exports;
// })({});
// main.run();

var exports = exports || {};
exports.expire                = expire;
exports.github_repository_url = github_repository_url;
exports.is_cached_expired     = is_cached_expired;
exports.is_github_repository  = is_github_repository;
exports.is_storage_full       = is_storage_full;
