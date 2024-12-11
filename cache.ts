import fs from "fs";
import path from "path";
import md5 from "md5";

/**
 * 缓存机制
 */
export default class Cache {
    static $map: Record<string, string> = {};
    static $file = "";
    static $modified = false;
    static debug = false;
    static initialize() {
        Cache.$file = path.join(__dirname, ".cache");
        if (fs.existsSync(Cache.$file)) {
            try {
                Cache.$map = JSON.parse(fs.readFileSync(Cache.$file, { encoding: "utf-8" }));
            } catch (e) {
                Cache.$map = {};
            }
        }
    }
    static compare(key: string, value: string) {
        return Cache.read(key) === value;
    }
    static read(key: string) {
        return Cache.$map[key];
    }
    static get modified() {
        return Cache.$modified;
    }
    static write(key: string, value: string) {
        Cache.$map[key] = value;
        Cache.$modified = true;
        Cache.debug && console.log("文件加入缓存", key, value);
    }
    static save() {
        if (!Cache.$modified) return;
        fs.writeFileSync(Cache.$file, JSON.stringify(Cache.$map, null, 2), { encoding: "utf-8" });
        Cache.$modified = false;
        Cache.debug && console.log("缓存已更新");
    }
    static hash(file: string) {
        const buf = fs.readFileSync(file);
        const u8 = new Uint8Array(buf);
        return md5(u8);
    }
}
