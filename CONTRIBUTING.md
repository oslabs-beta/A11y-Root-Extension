<p align="center"> <img src="src/assets/a11y-root-icon_360.png" width="140px;" alt=""/></p>

# A11y Root VS Code Extension - Contributions Welcome!

The following is specific to the extension portion of the A11y Root project. 

For details on contributing to the VS Code webpage, server, or database, [click here](https://github.com/oslabs-beta/A11y-Root-Webpage/).

---

## Running in Dev

At this time, if you would like to contribute to the extension itself, please contact the primary developer team (see: [README](README.md)).

We are working on a containerized solution for development that would allow spinning up local server, in order to serve the extension locally.
Once available, this document will be updated with instructions on how to spin up a dev version of the extension.

---

## Contribution Guidelines

Please follow the below steps when looking to make contributions to the project.

1. Fork your own copy of the repository. 

2. Features/fixes should always be contained to branches off of dev.

3. Develop *and test* your code changes. Update or add docs as needed to explain critical features (API endpoints, environmental requirements, etc.)

4. Commit message(s) should clearly describe the changes.

5. Send a pull request.

6. A team member will review your pull request. Expect some back-and-forth on styling and codebase conformance before your feature is merged into dev.

---

## Project Roadmap

### Features

- Expanded detection/analysis of [WCAG Level A](https://www.w3.org/TR/WCAG22/) compliance issues
    - Eventual incorporation of Level AA checks (optional - user selects which level compliance they would like analysis for)

- More verbose explanations, suggestions, and links to resources when compliance issues are detected

- Interactive Issue Resolver: Pair visualized issues with suggested fixes. Developers could click on an issue in the tree to see recommended changes and directly navigate to the relevant code

- Linter incorporation: Integrate eslint-plugin-jsx-a11y into the extension, which can catch certain accessibility issues as developers are writing, further improving a11y awareness in the development process

### Compatibility

- Linux / WSL Ubuntu compatibility: Currently, the extension does not work in Linux due to how Puppeteer is used. Puppeteer utilizes a headless Chromium browser to manipulate the webpage DOM and create the accessibility tree. Attempting to run this process in Linux currently has dependency issues we are working to resolve
    - Temporary solution offered is to manually install missing dependencies:

    >sudo apt install libgtk-3-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2

- In some cases, Windows and MacOS users encounter an issue where Puppeteer is looking for a specific version of Chrome. Proper solution TBD.

### Optimization

- Reducing size of extension to be listable on the [Visual Studio Marketplace](https://marketplace.visualstudio.com/vscode)
    - The extension currently exceeds the maximum size requirement for listing on the official extension marketplace. This is primarily a result of the dependencies, particularly Puppeteer.

### Bugs

There are some known bugs with the extension, such as: 

- The "Generate URL" field adding an extra "/" to the URL when navigating between the Custom Page and Use Dropdown options.

- When a user initially signs in with GitHub, the extension may not re-render automatically. Closing and re-opening is the current workaround.

- General bugs around parsing 