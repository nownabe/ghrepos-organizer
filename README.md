# ghrepos-organizer

[![npm](https://img.shields.io/npm/v/ghrepos-organizer)](https://www.npmjs.com/package/ghrepos-organizer)
[![GitHub](https://img.shields.io/github/license/nownabe/ghrepos-organizer)](https://github.com/nownabe/ghrepos-organizer/blob/main/LICENSE)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/5efa494bbcd14a24be0926564394f621)](https://www.codacy.com/gh/nownabe/ghrepos-organizer/dashboard?utm_source=github.com&utm_medium=referral&utm_content=nownabe/ghrepos-organizer&utm_campaign=Badge_Grade)
[![Maintainability](https://api.codeclimate.com/v1/badges/b52e422153bb830c8111/maintainability)](https://codeclimate.com/github/nownabe/ghrepos-organizer/maintainability)

ghrepos-organizer organizes your GitHub repositories in a batch.

https://user-images.githubusercontent.com/1286807/157036453-9383534d-27ce-4ba0-8dca-39e3d5729565.mp4

## Usage

```bash
npx ghrepos-organizer
```

You can use some environment variables to configure ghrepos-organizer.

- `GH_PAT`: Your personal access token.
- `CONCURRENCY`: Concurrency.
- `ENABLE_DELETE`: Enable delete action.

## Actions

- Delete chosen repositories
- Close all issues of chosen repositories
- Close all pull requests of chosen repositories
- Update chosen repository
  - Set visibility (public/private)
  - Enable/disable wikis feature
  - Enable/disable projects feature
  - Enable/disable automatically branch deletion on pull requests
  - Archive
- Transfer chosen repositories to a specified destination repository

## Personal Access Token

ghrepos-organizer requires your personal access token, selecting `repo` scope.
If you want to delete repositories, `delete_repo` scope is also needed.
