import {
	readlines,
	write,
	exists,
	touch,
	resolve_dir
} from "computer";
import Program from "termite";

const FILE = `${process.env.HOME}/.path`;

touch(FILE); // just in case!

export const PATHS = process.env.PATH.split(':').filter(x => x);
export const PROFILE = readlines(FILE);

const render_status = path => `${path} ${exists(path) ? '✔' : '✗ (broken link)' }`;
const render_origin = path => `${path} [${PROFILE.includes(path) ? '~/.path' : 'env'}]`;
const save = paths => write(FILE, paths.join('\n'));

export default Program({
	["@default"]() {
		this.header('CURRENTLY ACTIVE PATH');
		this.list(PATHS.map(render_status).map(render_origin));

		if (PROFILE.length) {
			this.header('PATH PROFILE (~/.path)');
			this.list(PROFILE.map(render_status).map(render_origin));
		}
	},
	export() {
		// TODO: add filter for broken links! Might as well :)
		this.println(PROFILE.concat(PATHS.filter(path => !PROFILE.includes(path))).join(':'));
		save(PROFILE); // clean-up, baby.
	},
	add(path) {
		path = resolve_dir(path);
		this.header(`ADD: ${path}`);

		if (PATHS.includes(path))
			return this.warn(`this path is already defined elsewhere. DO NOTHING.`) &&
				this.log(`probably in ~/.bashrc or ~/.profile`);
		
		if (PROFILE.includes(path))
			return this.done(`path already exists in configuration. DO NOTHING.`);
		
		// That should be it!
		let profiles = PROFILE.concat([path]);
		save(profiles);
		this.list(profiles);
		this.done();
	},
	remove(path) {
		path = resolve_dir(path);
		this.header(`REMOVE: ${path}`);

		if (PATHS.includes(path))
			this.warn(`${path} is defined elsewhere and cannot be fully removed.`) &&
				this.log(`Try ~/.bashrc or ~/.profile files...`);

		if (!PROFILE.includes(path))
			return this.warn(`path was not found in configuration. DO NOTHING.`);
		
		let profiles = PROFILE.filter(p => p !== path);
		save(profiles);
		if (profiles.length)
			this.list(profiles);
		else
			this.done();
	},
});