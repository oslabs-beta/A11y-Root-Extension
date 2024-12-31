<p align="center"> <img src="src/assets/a11y-root-icon_360.png" width="140px;" alt=""/></p>

# A11y Root VS Code Extension - Contributions Welcome!

The following is specific to the extension portion of the A11y Root project. 

For details on contributing to the VS Code webpage, server, or database, [click here](https://github.com/oslabs-beta/A11y-Root-Webpage/).

---

## Running in Dev



### Environmental Variables



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

### Optimization

- Reducing size of extension to be listable on the [Visual Studio Marketplace](https://marketplace.visualstudio.com/vscode)
    - The extension currently exceeds the maximum size requirement for listing on the official extension marketplace. This is primarily a result of the dependencies, particularly Puppeteer.