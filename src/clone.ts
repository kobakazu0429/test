export const clone = <T>(target: any): T => {
  const result: any = Array.isArray(target) ? [] : {};
  for (const key in target) {
    const value = target[key];
    const type = value.toString();
    if (type === "Array" || type === "Object") {
      result[key] = clone(value);
    } else {
      result[key] = value;
    }
  }
  return result;
};
