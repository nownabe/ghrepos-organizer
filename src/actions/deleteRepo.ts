import type { ActionBuilder } from ".";

const builder: ActionBuilder = async (octokit) => {
  return async (repo) => {
    console.log("deleteRepos");
  };
};

export default builder;
