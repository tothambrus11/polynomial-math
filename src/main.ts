import {Polynomial, eec, resetEEC} from "./Polynomial";
import {performance} from "perf_hooks";

import * as fs from "fs";

let p = new Polynomial([15, -2, -18, 6, -8, 16]);
let p2 = new Polynomial([1, 1, 1, 1, 1, 1, 1, 1,1]);

//console.log("(" + p.toString() +") / ("+ p2.toString()+ ") = " + p.divide(p2).result.toString());
//console.log("Remainder: " + p.divide(p2).remainder.toString());


let out = '';

console.log("start")
for (let i = 0; i < 30; i++) {
    console.log("row ", i);
    for (let j = 0; j < 20; j++) {
        let start = performance.now();
        //p2.pow(j)

        for (let k = 0; k < 1000; k++) {
            let result = new Polynomial([1]);
            for (let a = 0; a < j; a++) {
                result._mult(p2);
            }

        }


        out += (j == 0 ? '' : '\t') + (performance.now() - start);
    }
    p2.coefficients.push(2.00001);
    out += "\n";
    out = out.replace(/\./g, ',')
    fs.writeFileSync("out.txt", out);
}

