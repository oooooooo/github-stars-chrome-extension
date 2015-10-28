'use strict';

var assert = require('power-assert');
var main = require('../js/main.js');

describe('main', function() {
  it('github_repository_url', function() {
    assert.equal(main.github_repository_url({href: 'http://github.com/hello/world'}),  'hello/world');
    assert.equal(main.github_repository_url({href: 'https://github.com/hello/world'}), 'hello/world');

    assert.equal(main.github_repository_url({href: 'https://github.com/a'}),      null);
    assert.equal(main.github_repository_url({href: 'https://github.com/a/b'}),    'a/b');
    assert.equal(main.github_repository_url({href: 'https://github.com/a/b/c'}),  null);
    assert.equal(main.github_repository_url({href: 'https://github.com/a/'}),     null);
    assert.equal(main.github_repository_url({href: 'https://github.com/a/b/'}),   'a/b');
    assert.equal(main.github_repository_url({href: 'https://github.com/a/b/c/'}), null);
  });

  it('is_github_repository', function() {
    assert.equal(main.is_github_repository('someone/something'), true);

    assert.equal(main.is_github_repository(null),                false);
    assert.equal(main.is_github_repository('blog/something'),    false);
    assert.equal(main.is_github_repository('someone/following'), false);
    assert.equal(main.is_github_repository('someone/dummy'),     false);

    assert.equal(main.is_github_repository('organizations/new'),     false);
    assert.equal(main.is_github_repository('settings/profile'),      false);
    assert.equal(main.is_github_repository('account/organizations'), false);
    assert.equal(main.is_github_repository('site/terms'),            false);
    assert.equal(main.is_github_repository('site/privacy'),          false);
  });

  it('is_cached_expired', function() {
    assert.equal(main.is_cached_expired({expire: Date.now() - main.expire - 1}), true);
    assert.equal(main.is_cached_expired({expire: Date.now() - main.expire}),     false);
    assert.equal(main.is_cached_expired({expire: Date.now()}),                   false);
    assert.equal(main.is_cached_expired({expire: Date.now() + main.expire}),     false);
    assert.equal(main.is_cached_expired({expire: Date.now() + main.expire + 1}), false);
  });

  it('is_storage_full', function() {
    global.chrome = {};
    chrome.storage = {};
    chrome.storage.local = {};
    chrome.storage.local.QUOTA_BYTES = 100;

    assert.equal(main.is_storage_full(89), false);
    assert.equal(main.is_storage_full(90), true);
    assert.equal(main.is_storage_full(100), true);
  });
});
