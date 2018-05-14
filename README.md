# Dessi

A quick, simple server-side-includes expander.

## What's server-side includes?

Server-side-includes (SSI) is one of the directives that most popular web servers like `httpd` (Apache) and `nginx` implement, that allow for "dynamic" construction of HTML without having a dynamic application running. You can decompose an HTML page into separate page parts, and "include" them using an HTML comment-like "include directive" in the HTML.

An SSI in action looks like this;

```html
<html>
  <head>
    <title>Main page</title>
    <!--#include virtual="/parts/head_part.html" -->
  </head>
  <body>
    <!--#include virtual="/parts/page_header_part.html" -->
    <main>...</main>
    <!--#include virtual="/parts/page_footer_part.html" -->
  </body>
</html>
```

The web server will attempt to parse the HTML for the include directives, and dynamically fill them in when the page is served.

### Why an expander?

I recently had to migrate an SSI-enabled static site out of a controlled environment with SSI into a completely static host. Rather than build a specific script to do the "expansion" into a completely static site, I wrote __Dessi__ to make the process generalizable to my other static sites.

## Install and use

Install with npm. Dessi is designed to be installed globally as an NPM package:

```sh
# with the npm package manager
npm install --global Dessi

# ... or with the yarn package manager
yarn global add Dessi
```

And that's it! Invoke Dessi by going to a directory that contains the files you'd like to expand, and run:

```sh
Dessi --source=<source directory> --target=<target directory>
```

You'll find more instructions in the __Manual__ section below.

## Manual

Dessi takes three command line arguments:

- **--source**: the source directory. Usually, I'll `cd` to this directory and just pass `--source=.`. This directory is also assumed to be the root of the website `/`, unless a `--root` option is specified.

- **--target**: the target or destination directory for the expansion. All files and folders in the source directory will be copied into this directory with the exception mentioned below (*). This is usually my `dist/` or `build/` directory of the project, and `.gitignore`'d.

- **--root** (optional): if the "root" directory of the static site (where index.html usually lives) is different than the `--source` directory, You can explicitly specify a different root directory to use in the expansion of files in the SSI directives. Otherwise, Dessi will default to the source directory specified.

For example:

```sh
Dessi --root=. --target=./dist --source=.
```

Note that Dessi explicitly requires you to use the `=` sign to specify options. This is something I'd like to fix but haven't had the time to yet, as it works fine without this functionality.

[__*__] Most of the time, I'd like to expand the contents of everything in a repository into a static folder _within_ that repository. Dessi handles this use case by ignoring the destination folder if that folder is nested within the source folder.

For example:

```sh
$ ls .

mydir/ destdir/ other_files.html

$ Dessi --source=. --target=./destdir

[...] # output abridged

$ ls destdir

mydir/ other_files.html # destdir/ is missing, since it was the target directory

```

## Future plans

These are things I'd like Dessi to be able to support, but haven't had time to add yet.

1. Support for replacing / expanding files in-place without copying.
2. Support for specifying options without the `=` signs.
3. Generally better and more helpful error handling.

# License

Dessi is licensed under the permissive MIT License. See `LICENSE` for more information.

