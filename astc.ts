import path from "path";
import child_process from "child_process";
import CFG from "./config";
import collector from "./collector";

/**
 * 图片转astc
 * @param from 输入路径
 * @param to 输出路径
 */
export default function ConvertToASTC(from: string, to: string) {
    const exec = path.resolve(CFG.ASTC_BIN);
    const cmd = `${exec} -cl ${from} ${to} ${CFG.TARGET} -${CFG.QUALITY}`;
    child_process.exec(cmd, (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            collector.remove(from, false);
        } else {
            // if (stdout) console.log(stdout);
            // if (stderr) console.error(stderr);
            collector.remove(from, true);
        }
    });
}
