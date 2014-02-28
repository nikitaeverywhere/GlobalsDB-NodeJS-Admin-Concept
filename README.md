GlobalsDB-NodeJS-Admin <b>concept</b>
======================

##### Note: this is a <i>demo</i> application. Code (engine) will be rewritten soon.

#### Update: <a href="https://github.com/ZitRos/globalsDB-Admin-NodeJS">GlobalsDB Admin released!</a>

Easy visual interface for administrating GlobalsDB. Represents database in hierarchical tree-based view - one you haven't seen before.

Note that <b>modules/cache.node</b> may be corrupted because of git file encoding. If NodeJS will throw error about cache.node module, download the latest one from [official site](http://www.globalsdb.org/downloads) and replace your current one.

### Installation

Copy files to any directory and start from <code>admin.js</code> file. Customize url/port settings in <code>settings.js</code>. Note that application is in-development and represents only main concept, so it doesn't have security at all. Use at your own risk!

### Troubleshooting

Make sure that:
* NodeJS and GlobalsDB are installed and connected with NodeJS using v1 adapter (important)
* You replaced basic settings in settings.js with yours
* cache.node isn't corrupted

If console throws error during startup about loading cache.node module, try to replace module file with latest module file in your GlobalsDB/bin directory. This file called like cacheXXX.node, copy and rename this file to project's /modules directory.
