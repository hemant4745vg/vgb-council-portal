const failures = [];
function check(name, actual, expected) {
  if (Math.abs(actual - expected) > 1e-6) failures.push(name + ": " + actual + " !== " + expected);
}
function fact(n) { let out = 1; for (let i = 2; i <= n; i += 1) out *= i; return out; }
function det3(m) {
  const [a, b, c] = m[0]; const [d, e, f] = m[1]; const [g, h, i] = m[2];
  return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
}
check("demand-supply equilibrium", (90 - 10) / (0.75 + 0.65), 57.142857);
check("quadratic a=0", -6 / 3, -2);
check("binomial total", fact(4) / (fact(1) * fact(3)) * (2 ** 3) * 1, 32);
check("bayes", (0.9 * 0.3) / (0.9 * 0.3 + 0.2 * 0.7), 0.658536585);
check("school email", "student@vidyagyan.in".endsWith("@vidyagyan.in") ? 1 : 0, 1);
check("3x3 det", det3([[1, 0, 0], [0, 1, 0], [0, 0, 1]]), 1);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("formula checks passed");
