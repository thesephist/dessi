const path = require('path');
const fs = require('fs-extra');

const SSI_EXTENSIONS = [
    '.html',
    '.shtml',
];
const SSI_REGEX = new RegExp(/(.*)<!--#include\s+virtual="([\d\w\.\/\$\-\_]+)"\s?-->(.*)/, 'sm');

const log = (...args) => {
    console.log(...args);
}

const error = (...args) => {
    console.log(...args);
}

const progress = (...args) => {
    console.log('=>', ...args);
}

const checkpoint = (...args) => {
    console.log(' ✓', ...args);
}

const read_file = path => {
    return fs.readFileSync(path, {
        encoding: 'utf8',
    });
}

const dessi = async () => {

    // process arguments
    const args = process.argv.slice(1);
    const cwd = process.cwd();
    let root_dir,
        target_dir,
        source_dir;
    for (const arg of args) {
        if (arg.startsWith('--root=')) {
            root_dir = path.join(cwd, arg.substr(7));
        } else if (arg.startsWith('--target=')) {
            target_dir = path.join(cwd, arg.substr(9));
        } else if (arg.startsWith('--source=')){
            source_dir = path.join(cwd, arg.substr(9));
        }
    }

    log(`Expanding from:\n\t${source_dir}`);
    log(`Saving to:\n\t${target_dir}`);
    log(`Path root:\n\t${root_dir}`);
    log('');

    if (root_dir === undefined) {
        root_dir = source_dir;
    }

    if (!(
        source_dir && target_dir && root_dir
    )) {
        error('Please specify the --source and --target directories.');
        return;
    }

    // copy source_dir to target_dir, parsing any relevant files
    const ssi_expand = (content) => {
        const translate_path = (root_dir, rest) => path.join(root_dir, rest);

        const parts = content.split('<!--#')
            .map((bit, idx) => idx ? '<!--#' + bit : bit);
        const result = [];
        for (const part of parts) {
            const match = SSI_REGEX.exec(part);
            if (match !== null) {
                const [_discard, pre, includePath, post] = match;

                let file_contents = read_file(translate_path(root_dir, includePath));
                if (SSI_EXTENSIONS.includes(path.extname(includePath))) {
                    log(`Following nested include ${includePath}`);
                    file_contents = ssi_expand(file_contents);
                }

                result.push(pre);
                result.push(file_contents);
                result.push(post);
            } else {
                result.push(part);
            }
        }
        return result.join('');
    }

    const process_dir = async (working_source_dir, working_target_dir) => {
        const children = await fs.readdir(working_source_dir);
        for (const child of children) {
            const is_dir = fs.lstatSync(path.join(working_source_dir, child)).isDirectory();
            const absolute_source_path = path.join(working_source_dir, child);
            const absolute_target_path = path.join(working_target_dir, child);

            if (path.basename(absolute_source_path).startsWith('.')) {
                checkpoint(`Ignoring dotfile ${path.relative(cwd, absolute_source_path)}`);
                continue;
            } else {
                progress(`Processing ${path.relative(cwd, absolute_source_path)}`);
            }

            if (is_dir) {
                if (path.join(absolute_source_path, path.sep).includes(target_dir)) {
                    checkpoint(`Ignoring nested target dir ${path.relative(cwd, absolute_source_path)}`);
                } else {
                    await fs.ensureDir(absolute_target_path);
                    await process_dir(
                        absolute_source_path,
                        absolute_target_path
                    );
                }
            } else {
                if (SSI_EXTENSIONS.includes(path.extname(absolute_source_path))) {
                    fs.writeFileSync(
                        absolute_target_path,
                        ssi_expand(read_file(absolute_source_path)),
                        {
                            encoding: 'utf8',
                        }
                    );
                } else {
                    await fs.copy(absolute_source_path, absolute_target_path);
                }
            }
        }
    }

    process_dir(source_dir, target_dir);
}

module.exports = dessi;

