export interface AsyncData<T> {
  done: boolean;
  data?: T;
}

interface AsyncFunction<T> extends Function {
  (): PromiseLike<AsyncData<T>>;
}
type PromiseExecuter<T> = (
  resolve: (value: T | PromiseLike<T | undefined> | undefined) => void,
  reject: (reason?: unknown) => void
) => void;

export async function asyncPoll<T>(
  fn: AsyncFunction<T>,
  pollInterval: number = 5 * 1000,
  pollTimeout: number = 30 * 1000
): Promise<T | undefined> {
  const endTime = new Date().getTime() + pollTimeout;
  const checkCondition: PromiseExecuter<T> = async (
    resolve,
    reject
  ): Promise<void> => {
    try {
      const result = await fn();
      const now = new Date().getTime();
      if (result.done) {
        resolve(result.data);
      } else if (now < endTime) {
        setTimeout(checkCondition, pollInterval, resolve, reject);
      } else {
        reject(new Error("AsyncPoller: reached timeout"));
      }
    } catch (err) {
      reject(err);
    }
  };
  return new Promise(checkCondition);
}
