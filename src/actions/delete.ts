import type { ActionBuilder } from ".";

const builder: ActionBuilder = async (octokit) => {
  return async (repo, updateText) => {
    updateText("deleting repository");

    await octokit.request("DELETE /repos/{owner}/{repo}", {
      owner: repo.owner.login,
      repo: repo.name,
    });
  };
};

export default builder;
