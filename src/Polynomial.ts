export let eec = 0;
export function resetEEC(){
    eec = 0;
}
export class Polynomial {
    constructor(public coefficients: number[] = []) {
    }

    _add(other: Polynomial) {
        for (let i = 0; i < other.coefficients.length; i++) {
            if (other.coefficients[i]) {
                this.coefficients[i] ||= 0;
                this.coefficients[i] += other.coefficients[i];
            }
        }
    }

    _sub(other: Polynomial): Polynomial {
        for (let i = 0; i < other.coefficients.length; i++) {
            this.coefficients[i] = (this.coefficients[i] || 0) - (other.coefficients[i] || 0);
        }
        return this;
    }


    mult(other: Polynomial): Polynomial {
        let res = new Polynomial([]);
        this.optimize();
        other.optimize();
        //                                                   v because of 0. element
        for (let i = 0; i < this.degree() + other.degree() + 1; i++) {
            res.coefficients.push(0);
        }
        for (let i = 0; i < other.coefficients.length; i++) {
            for (let j = 0; j < this.coefficients.length; j++) {
                res.coefficients[i + j] += (this.coefficients[j] || 0) * (other.coefficients[i] || 0);
                eec++;
            }
        }
        return res;
    }

    divide(divider: Polynomial): { result: Polynomial, remainder: Polynomial } {
        let result = new Polynomial([]);
        let remainder = this.copy();
        remainder.optimize();

        while (remainder.degree() >= divider.degree()) {
            let resCoefficient = remainder.coefficients[remainder.degree()] / divider.coefficients[divider.degree()];
            let resDegree = remainder.degree() - divider.degree();
            result.coefficients[resDegree] = resCoefficient;

            let resPolynomial = new Polynomial([]);
            resPolynomial.coefficients[resDegree] = resCoefficient;

            remainder._sub(resPolynomial.mult(divider));
            remainder.optimize();
        }

        return {result, remainder};
    }

    degree(): number {
        return this.coefficients.length - 1;
    }

    toString(verbose = false) {
        let output = "";
        let isFirst = true;
        for (let i = this.coefficients.length - 1; i >= 0; i--) {
            if (verbose || this.coefficients[i]) {
                output += (this.coefficients[i] >= 0) ? (isFirst ? "" : " + ") : " - ";
                isFirst = false;
                output += !verbose && i != 0 && Math.abs(this.coefficients[i]) == 1 ? '' : Math.abs(this.coefficients[i] || 0);
                if (i > 1) output += "x^" + i;
                else if (i == 1) output += "x";

            }
        }
        return output || '0';
    }

    print(verbose = false) {
        console.log(this.toString(verbose));
    }

    public optimize() {
        for (let i = this.coefficients.length - 1; i >= 0; i--) {
            if (!this.coefficients[i]) this.coefficients.pop();
            else return;
        }
    }

    _mult(other: Polynomial) {
        this.coefficients = this.mult(other).coefficients;
        return this;
    }

    copy(): Polynomial {
        return new Polynomial([...this.coefficients]);
    }

    /**
     * Raises the polynomial to the n<sup>th</sup> power, returns the result
     * @param n the power: non-negative integer (including zero)
     */
    pow(n): Polynomial {
        if (n == 0) return new Polynomial([1]); // shortcut - it would work without this

        let result = Polynomial.initWithDegree(n * this.degree());

        let processOutcome = (r) => {
            let coefficient = factorial(n);
            let finalExponent = 0;
            for (let i = 0; i < r.length; i++) {
                //console.log("("+this.coefficients[exponents[i]]+"x^"+exponents[i] + ")^"+ r[i]);
                coefficient *= Math.pow(this.coefficients[exponents[i]], r[i]) / factorial(r[i])
                finalExponent += exponents[i] * r[i];
                eec++;
            }
            result.coefficients[finalExponent] += coefficient;
        }

        let exponents = [];

        for (let i = 0; i < this.coefficients.length; i++) {
            if (this.coefficients[i]) {
                exponents.push(i);
            }
        }
        if (exponents.length == 0) {
            return result;
        }


        const ekCount = exponents.length - 1;

        if (ekCount == 0) {
            //printEks([]);
            processOutcome([n])
        } else { // ekCount >= 1

            let ekPos = Array(ekCount).fill(n);
            let r = Array(ekCount+1).fill(0);
            r[0] = n;

            // printEks(ekPos);
            processOutcome(r);

            let i, targetPos;
            while (ekPos[ekCount - 1] !== 0) {
                for (i = 0; i < ekPos.length; i++) {
                    targetPos = ekPos[i] - 1;
                    if (targetPos >= 0) {
                        for (let j = 0; j <= i; j++) {
                            ekPos[j] = targetPos;
                        }
                        break;
                    }
                }

                r[0] = ekPos[0];
                for (let i = 1; i < ekPos.length; i++) {
                    r[i] = ekPos[i] - ekPos[i - 1];
                }
                r[ekPos.length] = n - ekPos[ekPos.length - 1];
                processOutcome(r);
            }
        }


        function printEks(ekPos) {
            let pos = 0;
            let out = "";
            for (let i = 0; i < ekPos.length; i++) {
                let diff = ekPos[i] - pos;
                pos = ekPos[i];
                for (let j = 0; j < diff; j++) {
                    out += '\t\x1b[31mO\x1b[0m ';
                }
                out += '\x1b[33m|\x1b[0m'
            }
            for (; pos < n; pos++) {
                out += '\t\x1b[31mO\x1b[0m ';
            }
            //console.log(out)
        }

        // https://pdf.sciencedirectassets.com/272574/1-s2.0-S0022000073X80023/1-s2.0-S0022000073800030/main.pdf?X-Amz-Security-Token=IQoJb3JpZ2luX2VjENv%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIFtygY%2FWdkriS%2FQymMLL5Q3jT6YA%2BlxHNshvQREMsfhQAiEAlAU%2FyIYE%2FEukH%2BffiLaPET8TjkdyHdM0BbeSgqYHRawqgwQI1P%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAEGgwwNTkwMDM1NDY4NjUiDFCn5dkZTDjXJl%2FUQCrXA3InGjclYp3RBjpXoAG42tkr94xug8dtz32x9WxPjX3dhpF87wLtAsCV34JbMD24Bmg2AELjzAD5cIq5aCRcYwwVJzAHZK%2B9A2eZBVQKzBLMxPdECRWiSePyx0DYMGZf7Bem4hhj2%2BU5BOolddOv1%2B8X%2BJSd4lOqF8Xqt13atwM37onXzulZ6wErEjM5qyf1t3%2Fjmz5bEjPqmSE7bVH7YkyoeBdfzXXUS%2BVwsDYgnEdsmz4953jza4XP6EiY2rsB4SBZ5OIrT0U1aZVjSvki4wOAdGI1i95QYF9Ff%2BWKF2piPZt9O6uEZAhGjrjpTtFzAN2wQYTltbCXPy4lnt99z2UTVUiaYm8Qguf41MFhmrbWm%2Bu9AIG2xL%2FcVowYsx2zj12XtdR9vhHC03wddy4WH%2BLM3YeS39ThCn2Hn3f3sxTFwaR7gIUEHYA5zMYkgLkMQowOFGG07Zz%2FNxNqUHTMEseNApI9fVYiFvjVQWep5pFc0bGvOcgjiU3CgwwhVbpw50y76%2BjAZH2ZMfZhsM3TBOKJDtDL6rR%2Bimyhuhji31Y%2BKp5yBlS0s05F4h3qVTKkns3qMtCwwv%2FpYjqCBrDoRB17k8xe8jW6clW349efK6JvJQ5hpk0z9jDw%2FLCOBjqlAbqFV8Y3QHCT%2FVlStK6TU3M5pPydgUcx9axIsAjDxpVXm8vMQOh5M8etlP7bAOvn7qvlpFdOMnUiW5rooTvpDLgdcUSbSDfi48YoitryyFz2XlEAFP51KjJFQeDADgoPazwottassb1SRdKJJCSqlqdeN%2BXd%2FdNQAvWl6Zn2Lv9mMmTeKq6eDaOHVU0n03N3zqfA%2B7i%2FfUAV%2BmpnAbpquSjGbLju3A%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20211229T123311Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIAQ3PHCVTY7VW37ZNQ%2F20211229%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=66081a2639cbfe037f42c340f26cc7921fc57220573b8a9f20b0e5c90222438a&hash=ac8b9c9714199bce821b3064f3ebd0d3f5ab2da932e92cad1995eb5740e30992&host=68042c943591013ac2b2430a89b270f6af2c76d8dfd086a07176afe7c76c2c61&pii=S0022000073800030&tid=spdf-5acbfa3e-1036-4acb-8651-433b9856fe26&sid=ad72e3707a6499413a19b1c063737cb31927gxrqb&type=client
        // https://math.stackexchange.com/questions/2652580/how-to-expand-nth-power-of-a-polynomial

        return result;
    }

    static initWithDegree(degree: number) {
        return new Polynomial(Array(degree + 1).fill(0))
    }
}

let factorials = [1, 1];

function factorial(n) {
    if (!factorials[n]) {
        for (let i = factorials.length; i <= n; i++) {
            factorials[i] = factorials[i - 1] * i;
        }
    }
    return factorials[n];
}

factorial(1000);
