# OSP - A11y Root 🌱

**“A Visual Studio Code extension rooted in accessibility”**

Developed through **OSLabs**, a nonprofit tech accelerator, **A11y Root** is a **VS Code Extension** paired with a **Companion Web Dashboard**. It streamlines accessibility analysis and fosters collaboration across development teams by exposing accessibility insights and enabling seamless communication between developers, designers, and stakeholders.

---

## Overview

A11y Root integrates **WCAG compliance** tools directly into the development workflow. The extension provides:

- **Accessibility Tree Visualization**: Exposes the full accessibility tree, allowing developers to understand how assistive technologies interact with the DOM.
- **Real-Time Analysis**: Detects WCAG guideline issues in projects and provides actionable insights.
- **Team Collaboration**: Enables sharing of accessibility reports through public links for seamless collaboration.
- **Simplified Development Workflow**: Makes accessibility a priority from day one.

---

## Features

### **VS Code Extension**

- Built with **React** and the **VS Code API**, the extension integrates accessibility analysis directly into the IDE.
- Key functionalities include:
  - Visualizing **header hierarchies**, **tabindex**, and **skip links**.
  - Mapping the **entire accessibility tree** for web page architectures.
  - Identifying and reporting **non-compliant elements**.

### **Puppeteer Integration**

- Utilized Puppeteer for:
  - Generating accessibility trees.
  - Performing **headless browser navigation** to analyze DOM structures.
- Chose Puppeteer over Playwright for its ability to produce a **physical accessibility tree**, critical for visualization.

### **Companion Web Dashboard**

- Built with **React**, the dashboard:
  - Displays accessibility tree visualizations for projects.
  - Allows toggling of non-compliant UI components.
  - Provides **shareable public links** for cross-team collaboration.

### **Collaborative Features**

- Enables sharing of page-specific accessibility data.
- Bridges communication gaps between developers, designers, and stakeholders.

---

## Tech Stack

- **VS Code Extension API**
- **TypeScript**
- **React** / **React Router**
- **Express**
- **Puppeteer**
- **GitHub OAuth**
- **MongoDB / Mongoose**

---

## Key Decisions

### Puppeteer Over Playwright

- **Why Puppeteer?**:
  - Puppeteer’s `accessibility.snapshot()` provides full accessibility trees for visualization.
  - Playwright's newer `ariaSnapshot()` focuses on individual elements, limiting comprehensive tree generation.
- **Fun Fact**: Playwright, though created by the same team, supports more browsers (Chromium, WebKit, Firefox), but Puppeteer’s focus on Chromium was better suited for our needs.

### MongoDB Over SQL

- MongoDB was chosen for its ability to handle **highly nested accessibility trees** and provide a flexible schema.
- JSON-based storage simplified retrieval and accelerated development, making it ideal for this project.

---

## Authentication

- **GitHub OAuth x 2**:
  - Streamlined developer login for both the VS Code extension and the companion web app.
  - **Why GitHub OAuth?**:
    - Easy setup compared to Google OAuth.
    - Tailored for developers, aligning with their existing GitHub accounts.

---

## Impact

By integrating the VS Code extension with a **centralized database** and **companion web dashboard**, **A11y Root** creates a robust ecosystem for accessibility analysis.

- Developers benefit from actionable insights directly within their workflow.
- Project stakeholders gain a centralized, shareable resource to address accessibility issues collaboratively.

**“Planting accessibility (a11y) into the development workflow from day one.”**

---

## Get Started

1. **Install the VS Code Extension**: [Link to extension marketplace]
2. **Access the Companion Web App**: [Link to web dashboard]
3. **Authenticate with GitHub OAuth**: Streamlined login process for developers.
4. Start building with accessibility in mind!

---

## License

This project is licensed under the Apache License, Version 2.0. See the [LICENSE](./LICENSE) file for details.

---

## Contributing

We welcome contributions from the community! Check out our [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to get involved.

---

## Acknowledgments

- **OSLabs**: For supporting this project through their nonprofit tech accelerator program.
- **Puppeteer Team**: For their robust accessibility tools and support.

---

## Contact

For questions, feedback, or collaboration opportunities, please contact us at [your email/contact info].
