import type { ActionBuilder } from ".";

const builder: ActionBuilder = async (octokit) => {
  return async (repo) => {
    const sleep = () =>
      new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
    await sleep();
  };
};

export default builder;
