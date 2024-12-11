import fs from "fs";
import path from "path";
import CFG from "./config";
import collector from "./collector";
import ConvertToASTC from "./astc";
import Cache from "./cache";

const IMAGE_EXTENSIONS: string[] = [".png", ".jpg", ".jpeg"] as const;

function traverse(start: string, root: string) {
    const ret: string[] = [];
    const files = fs.readdirSync(root);
    files.forEach((file) => {
        const from = path.join(root, file);
        const stat = fs.statSync(from);
        if (stat.isDirectory()) {
            ret.push(...traverse(start, from));
        } else if (IMAGE_EXTENSIONS.includes(path.extname(file).toLowerCase())) {
            ret.push(from);
        }
    });
    return ret;
}

function makedir(dir: string) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function convert() {
    if (!fs.existsSync(CFG.TO)) {
        fs.mkdirSync(CFG.TO);
    }
    Cache.initialize();
    const files = traverse(CFG.FROM, CFG.FROM);
    const fails: string[] = [];
    collector.onTaskCompleted((item: string, result: boolean) => {
        if (result) {
            Cache.write(item, Cache.hash(item));
        } else {
            fails.push(item);
        }
        console.log(`[astc] ${item} 压缩${result ? "成功" : "失败"}`);
    });
    collector.onFinished(() => {
        console.log(`[astc] 压缩全部完成.`);
        if (fails.length > 0) {
            console.log(`[astc] 失败列表: \n ${fails.join("\n ")}`);
        }
        Cache.save();
    });
    console.log("[astc] 压缩开始", files.length);
    const todos: [string, string][] = [];
    for (let i = 0; i < files.length; i++) {
        let from = files[i];
        let rel = path.relative(CFG.FROM, from);
        rel = rel.replace(path.extname(rel), ".astc");
        let to = path.join(CFG.TO, rel);
        from = path.resolve(from);
        to = path.resolve(to);
        const hash = Cache.hash(from);
        if (Cache.compare(from, hash)) {
            console.log(`[astc] ${from} 缓存命中，跳过.`);
            continue;
        }
        collector.add(from);
        makedir(path.dirname(to));
        todos.push([from, to]);
    }
    for (let i = 0; i < todos.length; i++) {
        ConvertToASTC(...todos[i]);
    }
}

function clear() {
    fs.rmSync(CFG.TO, { recursive: true, force: true });
    fs.rmSync(".cache", { force: true });
    makedir(CFG.TO);
}

switch (process.argv[2]) {
    case "-c":
    case "--clear":
        clear();
        break;
    case "-C":
    case "--convert":
        convert();
        break;
    case "-h":
    case "--help":
    case undefined:
    default:
        console.log("图片转ASTC工具");
        console.log(" -h/--help      查看帮助");
        console.log(" -c/--clear     清除缓存");
        console.log(" -C/--convert   启动转换");
        break;
}
