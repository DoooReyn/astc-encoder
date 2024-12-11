import fs from "fs";
import path from "path";
import CFG from "./config";
import collector from "./collector";
import ConvertToASTC from "./astc";
import cache from "./cache";

const IMAGE_EXTENSIONS: string[] = [".png", ".jpg", ".jpeg"] as const;

/**
 * 创建目录
 * @param dir 目标目录
 */
function makedir(dir: string) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

/**
 *
 * @param start 起始目录
 * @param root
 * @returns
 */
function traverse(root: string) {
    const ret: string[] = [];
    const files = fs.readdirSync(root);
    files.forEach((file) => {
        const from = path.join(root, file);
        const stat = fs.statSync(from);
        if (stat.isDirectory()) {
            ret.push(...traverse(from));
        } else if (IMAGE_EXTENSIONS.includes(path.extname(file).toLowerCase())) {
            ret.push(from);
        }
    });
    return ret;
}

function convert() {
    // 创建输出目录
    makedir(CFG.TO);
    // 初始化缓存
    cache.initialize();
    // 获取所有图片文件
    const files = traverse(CFG.FROM);
    // 失败任务列表
    const fails: string[] = [];
    // 任务收集器
    collector.onTaskCompleted((item: string, result: boolean) => {
        if (result) {
            cache.write(item, cache.hash(item));
            console.log(`[astc] ${item} 压缩成功.`);
        } else {
            fails.push(item);
            console.log(`[astc] ${item} 压缩失败！`);
        }
    });
    collector.onFinished(() => {
        cache.save();
        console.log(`[astc] 压缩全部完成.`);
        if (fails.length > 0) {
            console.log(`[astc] 失败列表: \n ${fails.join("\n ")}`);
        }
    });
    // 待压缩任务列表
    const todos: [string, string][] = [];
    for (let i = 0; i < files.length; i++) {
        let from = files[i];
        let rel = path.relative(CFG.FROM, from);
        rel = rel.replace(path.extname(rel), ".astc");
        let to = path.join(CFG.TO, rel);
        from = path.resolve(from);
        to = path.resolve(to);
        const hash = cache.hash(from);
        if (cache.compare(from, hash)) {
            console.log(`[astc] ${from} 缓存命中，跳过.`);
            continue;
        }
        collector.add(from);
        makedir(path.dirname(to));
        todos.push([from, to]);
    }
    // 开始压缩
    if (todos.length > 0) {
        console.log("[astc] 压缩开始，数量: " + todos.length);
        for (let i = 0; i < todos.length; i++) {
            ConvertToASTC(...todos[i]);
        }
    }
}

/**
 * 清除缓存
 */
function clear() {
    fs.rmSync(CFG.TO, { recursive: true, force: true });
    fs.rmSync(".cache", { force: true });
    makedir(CFG.TO);
    console.log("[astc] 缓存已清除.");
}

// 命令行参数
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
