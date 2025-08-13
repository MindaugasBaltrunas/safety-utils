export const extractSensitiveValues = <T extends object>(
  data: T,
  sensitiveKeys: readonly string[]
): Partial<T> => {
  return Object.keys(data).reduce((result, key) => {
    if (sensitiveKeys.includes(key) && data[key as keyof T] !== undefined) {
      return { ...result, [key]: data[key as keyof T] };
    }
    return result;
  }, {} as Partial<T>);
};

export const removeSensitiveFields = <T extends object>(
  data: T,
  sensitiveKeys: readonly string[]
): T => {
  return Object.keys(data).reduce((result, key) => {
    if (sensitiveKeys.includes(key)) {
      return { ...result, [key]: '' };
    }
    return { ...result, [key]: data[key as keyof T] };
  }, {} as T);
};

export const restoreSensitiveValues = <T extends object>(
  sanitizedData: T,
  sensitiveValues: Partial<T>
): T => {
  return { ...sanitizedData, ...sensitiveValues };
};
