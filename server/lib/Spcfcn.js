/**
 * Copyright 2016 Jim Armstrong (www.algorithmist.net)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
"use strict";
/**
 * Typescript Math Toolkit: A collection of special functions, often used in evaluation of statistical functions, mostly
 * taken from published sources, Numerical Recipes, and private communications.
 *
 * @author Jim Armstrong (www.algorithmist.net)
 *
 * @version 1.0
 */
var TSMT$Spcfcn = (function () {
    function TSMT$Spcfcn() {
        // empty
    }
    // regularized beta function (x in [0,1] not fully enforced)
    TSMT$Spcfcn.incompleteBeta = function (a, b, x) {
        if (Math.abs(x) < this.ZERO_TOL || Math.abs(x - 1.0) < this.ZERO_TOL) {
            return x;
        }
        if (a > 3000 && b > 3000) {
            return this.betaiapprox(a, b, x);
        }
        var bt = Math.exp(this.gammaln(a + b) - this.gammaln(a) - this.gammaln(b) + a * Math.log(x) + b * Math.log(1.0 - x));
        if (x < (a + 1.0) / (a + b + 2.0)) {
            return bt * this.betacf(a, b, x) / a;
        }
        else {
            return 1.0 - bt * this.betacf(b, a, 1.0 - x) / b;
        }
    };
    // beta CF
    TSMT$Spcfcn.betacf = function (a, b, x) {
        var qab = a + b;
        var qap = a + 1.0;
        var qam = a - 1.0;
        var c = 1.0;
        var d = 1.0 - qab * x / qap;
        if (Math.abs(d) < this.__fpmin) {
            d = this.__fpmin;
        }
        d = 1.0 / d;
        var h = d;
        var m;
        var m2;
        var del;
        var dc;
        var aa;
        for (m = 1; m < 10000; m++) {
            m2 = m + m;
            aa = m * (b - m) * x / ((qam + m2) * (a + m2));
            d = 1.0 + aa * d;
            if (Math.abs(d) < this.__fpmin) {
                d = this.__fpmin;
            }
            c = 1.0 + aa / c;
            if (Math.abs(c) < this.__fpmin) {
                c = this.__fpmin;
            }
            d = 1.0 / d;
            h *= d * c;
            aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
            d = 1.0 + aa * d;
            if (Math.abs(d) < this.__fpmin) {
                d = this.__fpmin;
            }
            c = 1.0 + aa / c;
            if (Math.abs(c) < this.__fpmin) {
                c = this.__fpmin;
            }
            d = 1.0 / d;
            del = d * c;
            h *= del;
            if (Math.abs(del - 1.0) <= this.__epsilon) {
                break;
            }
        }
        return h;
    };
    // inverse beta approximation
    TSMT$Spcfcn.betaiapprox = function (a, b, x) {
        var j;
        var xu;
        var a1 = a - 1.0;
        var b1 = b - 1.0;
        var ab = a + b;
        var abSq = ab * ab;
        var mu = a / ab;
        var lnmu = Math.log(mu);
        var lnmuc = Math.log(1.0 - mu);
        var t = Math.sqrt(a * b / (abSq * (ab + 1.0)));
        if (x > a / ab) {
            if (x >= 1.0) {
                return 1.0;
            }
            xu = Math.min(1.0, Math.max(mu + 10.0 * t, x + 5.0 * t));
        }
        else {
            if (x <= 0.0) {
                return 0.0;
            }
            xu = Math.max(0.0, Math.min(mu - 10.0 * t, x - 5.0 * t));
        }
        var sum = 0;
        for (j = 0; j < 18; j++) {
            t = x + (xu - x) * this.__y[j];
            sum += this.__w[j] * Math.exp(a1 * (Math.log(t) - lnmu) + b1 * (Math.log(1 - t) - lnmuc));
        }
        var ans = sum * (xu - x) * Math.exp(a1 * lnmu - this.gammaln(a) + b1 * lnmuc - this.gammaln(b) + this.gammaln(ab));
        return ans > 0.0 ? 1.0 - ans : -ans;
    };
    // ln(gamma) approximation
    TSMT$Spcfcn.gammaln = function (_x) {
        var j;
        var y = _x;
        var x = _x;
        var tmp = x + 5.24218750000000000;
        tmp = (x + 0.5) * Math.log(tmp) - tmp;
        var s = 0.999999999999997092;
        for (j = 0; j < 14; j++) {
            s += this.__c[j] / ++y;
        }
        return tmp + Math.log(2.5066282746310005 * s / x);
    };
    TSMT$Spcfcn.gammp = function (a, x) {
        // TODO Generalize zero-tolerance
        if (Math.abs(x) < 0.000000001) {
            return 0.0;
        }
        if (Math.floor(a) >= 100) {
            return this.gammapapprox(a, x, 1);
        }
        if (x < a + 1.0) {
            return this.gser(a, x);
        }
        else {
            return 1.0 - this.gcf(a, x);
        }
    };
    TSMT$Spcfcn.gammaq = function (a, x) {
        if (Math.floor(a) >= 100) {
            return this.gammapapprox(a, x, 0);
        }
        if (x < a + 1.0) {
            return 1.0 - this.gser(a, x);
        }
        else {
            return this.gcf(a, x);
        }
    };
    TSMT$Spcfcn.gammapapprox = function (a, x, psig) {
        var a1 = a - 1.0;
        var lna1 = Math.log(a1);
        var sqrta1 = Math.sqrt(a1);
        var gln = this.gammaln(a);
        var xu;
        if (x > a1) {
            xu = Math.max(a1 + 11.5 * sqrta1, x + 6.0 * sqrta1);
        }
        else {
            xu = Math.max(0.0, Math.min(a1 - 7.5 * sqrta1, x - 5.0 * sqrta1));
        }
        var j;
        var t;
        var sum = 0;
        for (j = 0; j < 18; j++) {
            t = x + (xu - x) * this.__y[j];
            sum += this.__w[j] * Math.exp(-(t - a1) + a1 * (Math.log(t) - lna1));
        }
        var ans = sum * (xu - x) * Math.exp(a1 * (lna1 - 1.0) - gln);
        return (psig ? (x > a1 ? 1.0 - ans : -ans) : (x > a1 ? ans : 1.0 + ans));
    };
    TSMT$Spcfcn.gser = function (a, x) {
        var gln = this.gammaln(a);
        var ap = a;
        var sum = 1.0 / a;
        var del = sum;
        for (;;) {
            ++ap;
            del *= x / ap;
            sum += del;
            if (Math.abs(del) < Math.abs(sum) * this.__epsilon) {
                return sum * Math.exp(-x + a * Math.log(x) - gln);
            }
        }
    };
    TSMT$Spcfcn.gcf = function (a, x) {
        var gln = this.gammaln(a);
        var b = x + 1.0 - a;
        var c = 1.0 / this.__fpmin;
        var d = 1.0 / b;
        var h = d;
        var i;
        var del;
        var an;
        // TODO Add iter limit to handle non-convergance due to bad inputs
        for (i = 1;; i++) {
            an = -i * (i - a);
            b += 2.0;
            d = an * d + b;
            if (Math.abs(d) < this.__fpmin) {
                d = this.__fpmin;
            }
            c = b + an / c;
            if (Math.abs(c) < this.__fpmin) {
                c = this.__fpmin;
            }
            d = 1.0 / d;
            del = d * c;
            h *= del;
            if (Math.abs(del - 1.0) <= this.__epsilon) {
                break;
            }
        }
        return Math.exp(-x + a * Math.log(x) - gln) * h;
    };
    TSMT$Spcfcn.invgammp = function (p, a) {
        var j;
        var x;
        var err;
        var t;
        var u;
        var pp;
        var lna1;
        var afac;
        var a1 = a - 1.0;
        var gln = this.gammaln(a);
        // out-of-range p ignored for internal method (args checked in advance of call)
        if (a > 1.0) {
            lna1 = Math.log(a1);
            afac = Math.exp(a1 * (lna1 - 1.) - gln);
            pp = (p < 0.5) ? p : 1.0 - p;
            t = Math.sqrt(-2.0 * Math.log(pp));
            x = (2.30753 + t * 0.27061) / (1.0 + t * (0.99229 + t * 0.04481)) - t;
            if (p < 0.5) {
                x = -x;
            }
            x = Math.max(1.e-3, a * Math.pow(1.0 - 1.0 / (9. * a) - x / (3.0 * Math.sqrt(a)), 3));
        }
        else {
            t = 1.0 - a * (0.253 + a * 0.12);
            x = (p < t) ? Math.pow(p / t, 1. / a) : 1.0 - Math.log(1.0 - (p - t) / (1.0 - t));
        }
        for (j = 0; j < 12; ++j) {
            if (x <= 0.0) {
                return 0.0;
            }
            err = this.gammp(a, x) - p;
            t = (a > 1.0) ? afac * Math.exp(-(x - a1) + a1 * (Math.log(x) - lna1)) : Math.exp(-x + a1 * Math.log(x) - gln);
            u = err / t;
            x -= (t = u / (1. - 0.5 * Math.min(1.0, u * ((a - 1.0) / x - 1))));
            if (x <= 0.0) {
                x = 0.5 * (x + t);
            }
            if (Math.abs(t) < this.__epsilon * x) {
                break;
            }
        }
        return x;
    };
    TSMT$Spcfcn.__stirlerr = function (n) {
        if (n < 16) {
            return this.__sfe[n];
        }
        var nSq = n * n;
        if (n > 500) {
            return ((this.__S0 - this.__S1 / nSq) / n);
        }
        if (n > 80) {
            return ((this.__S0 - (this.__S1 - this.__S2 / nSq) / nSq) / n);
        }
        if (n > 35) {
            return ((this.__S0 - (this.__S1 - (this.__S2 - this.__S3 / nSq) / nSq) / nSq) / n);
        }
        return ((this.__S0 - (this.__S1 - (this.__S2 - (this.__S3 - this.__S4 / nSq) / nSq) / nSq) / nSq) / n);
    };
    TSMT$Spcfcn.__dev = function (x, np) {
        var j;
        var s;
        var s1;
        var v;
        var ej;
        var xmnp = x - np;
        var xpnp = x + np;
        if (Math.abs(xmnp) < 0.1 * xpnp) {
            s = xmnp * xmnp / xpnp;
            v = xmnp / xpnp;
            ej = 2 * x * v;
            j = 1;
            // TODO Add iter limit to support non-convergence from very bad inputs
            while (true) {
                ej *= v * v;
                s1 = s + ej / (2 * j + 1);
                if (Math.abs((s1 - s) / s) < 0.01) {
                    return s1;
                }
                s = s1;
                j++;
            }
        }
        return x * Math.log(x / np) + np - x;
    };
    // TODO Need to overhaul documentation
    TSMT$Spcfcn.PI2 = Math.PI + Math.PI;
    TSMT$Spcfcn.ZERO_TOL = 0.00000001;
    TSMT$Spcfcn.__S0 = 1 / 12;
    TSMT$Spcfcn.__S1 = 1 / 360;
    TSMT$Spcfcn.__S2 = 1 / 1260;
    TSMT$Spcfcn.__S3 = 1 / 1680;
    TSMT$Spcfcn.__S4 = 1 / 1188;
    TSMT$Spcfcn.__epsilon = 2.220446049250313e-16;
    TSMT$Spcfcn.__fpmin = Number.MIN_VALUE / 2.220446049250313e-16;
    TSMT$Spcfcn.__sfe = [
        0,
        0.08106146679532758,
        0.04134069595440929,
        0.02767792568499833,
        0.02079067210376509,
        0.01664469118982119,
        0.01387612882307074,
        0.01189670994589177,
        0.01041126526197209,
        0.00925546218271273,
        0.00833056343336287,
        0.00757367548795184,
        0.00694284010720952,
        0.00640899418800421,
        0.00595137011275885,
        0.00555473355196280
    ];
    TSMT$Spcfcn.__w = [
        0.0055657196642445571,
        0.012915947284065419,
        0.020181515297735382,
        0.027298621498568734,
        0.034213810770299537,
        0.040875750923643261,
        0.047235083490265582,
        0.053244713977759692,
        0.058860144245324798,
        0.064039797355015485,
        0.068745323835736408,
        0.072941885005653087,
        0.076598410645870640,
        0.079687828912071670,
        0.082187266704339706,
        0.084078218979661945,
        0.085346685739338721,
        0.085983275670394821
    ];
    TSMT$Spcfcn.__y = [
        0.0021695375159141994,
        0.011413521097787704,
        0.027972308950302116,
        0.051727015600492421,
        0.082502225484340941,
        0.12007019910960293,
        0.16415283300752470,
        0.21442376986779355,
        0.27051082840644336,
        0.33199876341447887,
        0.39843234186401943,
        0.46931971407375483,
        0.54413605556657973,
        0.62232745288031077,
        0.70331500465597174,
        0.78649910768313447,
        0.87126389619061517,
        0.95698180152629142
    ];
    TSMT$Spcfcn.__c = [
        57.1562356658629235,
        -59.5979603554754912,
        14.1360979747417471,
        -0.491913816097620199,
        0.339946499848118887e-4,
        0.465236289270485756e-4,
        -0.983744753048795646e-4,
        0.158088703224912494e-3,
        -0.210264441724104883e-3,
        0.217439618115212643e-3,
        -0.164318106536763890e-3,
        0.844182239838527433e-4,
        -0.261908384015814087e-4,
        0.368991826595316234e-5
    ];
    return TSMT$Spcfcn;
}());
exports.TSMT$Spcfcn = TSMT$Spcfcn;
