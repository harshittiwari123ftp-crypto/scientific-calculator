export function evaluateExpression(expr: string): number {
  if (!expr || expr === '') return 0;

  let processedExpr = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, Math.PI.toString())
    .replace(/e/g, Math.E.toString());

  processedExpr = handleFactorials(processedExpr);
  processedExpr = handlePercentages(processedExpr);
  processedExpr = handlePowers(processedExpr);
  processedExpr = handleScientificFunctions(processedExpr);

  try {
    const result = Function('"use strict"; return (' + processedExpr + ')')();

    if (!isFinite(result)) {
      throw new Error('Result is infinite or NaN');
    }

    return result;
  } catch (error) {
    throw new Error('Invalid expression');
  }
}

function handleFactorials(expr: string): string {
  const factorialRegex = /(\d+(?:\.\d+)?)\!/g;

  return expr.replace(factorialRegex, (match, num) => {
    const n = parseFloat(num);
    if (n < 0 || !Number.isInteger(n)) {
      throw new Error('Factorial only works with non-negative integers');
    }
    return factorial(n).toString();
  });
}

function factorial(n: number): number {
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

function handlePercentages(expr: string): string {
  return expr.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
}

function handlePowers(expr: string): string {
  return expr.replace(/(\d+(?:\.\d+)?|\))(\^)(\d+(?:\.\d+)?|\()/g, 'Math.pow($1,$3)');
}

function handleScientificFunctions(expr: string): string {
  expr = expr.replace(/sin\(/g, 'Math.sin(toRadians(');
  expr = expr.replace(/cos\(/g, 'Math.cos(toRadians(');
  expr = expr.replace(/tan\(/g, 'Math.tan(toRadians(');

  expr = expr.replace(/asin\(/g, 'toDegrees(Math.asin(');
  expr = expr.replace(/acos\(/g, 'toDegrees(Math.acos(');
  expr = expr.replace(/atan\(/g, 'toDegrees(Math.atan(');

  expr = expr.replace(/log\(/g, 'Math.log10(');
  expr = expr.replace(/ln\(/g, 'Math.log(');
  expr = expr.replace(/sqrt\(/g, 'Math.sqrt(');

  const functionCount = (expr.match(/toRadians\(/g) || []).length +
                        (expr.match(/toDegrees\(/g) || []).length;

  const closingParensNeeded = ')'.repeat(functionCount);

  return `
    (function() {
      function toRadians(degrees) { return degrees * (Math.PI / 180); }
      function toDegrees(radians) { return radians * (180 / Math.PI); }
      return ${expr}${closingParensNeeded};
    })()
  `;
}

export function formatResult(result: number): string {
  if (Math.abs(result) < 0.000001 && result !== 0) {
    return result.toExponential(6);
  }

  if (Math.abs(result) > 999999999) {
    return result.toExponential(6);
  }

  const rounded = Math.round(result * 1000000000) / 1000000000;

  return rounded.toString();
}
