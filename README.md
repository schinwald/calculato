# Calculator App

A simple react app (without hooks), which simulates a calculator with memory. This application uses a state machine for advanced input handling and a binary tree for handling operations with precedence and associativity in mind.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### State Machine Diagram

This is an illustration of the state machine used to handle input along with its recovery transitions for handling errors along the way.

![calculator state machine](calculator-state-machine.png)
![calculator state machine recovery](calculator-state-machine-recovery.png)

### Learning Outcomes

- Understanding the "main concepts" of react and implementing them
    - States/props
    - Lifecycle
        - getDerivedStateFromProps()
        - componentDidMount()
        - shouldComponentUpdate()
        - render()
        - getSnapshotBeforeUpdate()
        - componentDidUpdate()
        - componentWillUnmount()
    - Handling events
    - Components as functions vs classes
    - Lists and keys
    - Conditional rendering
    - Lists and keys
    - Refs
    - Lifting state up using callback functions
- Understanding the advantages and disadvantages of client-side rendering (CSR) vs server-side rendering (SSR)
    - Slower load times vs Faster load times
    - Fully loaded vs partially loaded
    - Javascript required vs javascript not required
    - Bad SEO vs good SEO
- Get more practice with state machines
- Explore UIKit and some of the features they offer
    - Easy to use, but not very clean (similar to Bootstrap)
- Learn more about CSS
    - Animations/Keyframes
    - Pseudo elements/classes
        - :: Before/after
        - : Active/focus/hover

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
