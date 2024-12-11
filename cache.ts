import fs from "fs";
import path from "path";
import md5 from "md5";

/** MD5缓存 */
const MD5Cache = new Map<string, string>();

/**
 * 缓存机制
 */
class Cache {
    /** 缓存表 */
    private $map: Record<string, string> = {};
    /** 目标文件 */
    private $file = "";
    /** 修改状态 */
    private $modified = false;
    /** 调试模式 */
    private debug = false;

    /** 初始化 */
    public initialize() {
        this.$file = path.join(__dirname, ".cache");
        if (fs.existsSync(this.$file)) {
            try {
                this.$map = JSON.parse(fs.readFileSync(this.$file, { encoding: "utf-8" }));
            } catch (e) {
                this.$map = {};
            }
        }
    }

    /**
     * 缓存修改状态
     */
    public get modified() {
        return this.$modified;
    }

    /**
     * 与缓存比较
     * @param key 键
     * @param value 值
     * @returns
     */
    public compare(key: string, value: string) {
        return this.read(key) === value;
    }

    /**
     * 读取缓存
     * @param key 键
     * @returns
     */
    public read(key: string) {
        return this.$map[key];
    }

    /**
     * 写入缓存
     * @param key 键
     * @param value 值
     */
    public write(key: string, value: string) {
        this.$map[key] = value;
        this.$modified = true;
        this.debug && console.log("文件加入缓存", key, value);
    }

    /**
     * 持久化缓存
     */
    public save() {
        if (!this.$modified) return;
        fs.writeFileSync(this.$file, JSON.stringify(this.$map, null, 2), { encoding: "utf-8" });
        this.$modified = false;
        this.debug && console.log("缓存已更新");
    }

    /**
     * 获取文件 md5 值
     * @param file 文件路径
     * @returns
     */
    public hash(file: string) {
        if (!MD5Cache.has(file)) {
            const buf = fs.readFileSync(file);
            const u8 = new Uint8Array(buf);
            return md5(u8);
        }
        return MD5Cache.get(file)!;
    }
}

const cache = new Cache();
export default cache;
