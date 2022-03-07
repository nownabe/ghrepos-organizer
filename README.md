# ghrepos-organizer

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
