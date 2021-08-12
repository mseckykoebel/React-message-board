# Ladder React Challenge

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Running the application

First things first, clone the repo and run:

### 'npm install'

Then, in the the project directory, you can run:

### `yarn start`

Which runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Feature breakdown

### UI

The UI for this app remains mainly un-changed from the original Figma mock-ups. The app UI uses a mix of modified [Ionic Components](https://ionicframework.com/docs/components), and custom CSS. I liked the UI and didn't think it needed a lot of changes.

### UX

UX enhancements include the "loading" animation when a request is made to fetch more messages, and the buttons being disabled when the user has no t entered any input into the message field (primarily for mapping and visibility).

### Pagination

Pagination ended up being pretty non-trivial. I decided to go with a "load more" messages button that would load 10 messages at a time instead of a side-to-side paginator, and/or a paginator that loads all message documents into the client and paginates that way. I think it works better with a "load more" button as it seems to work best for all-screen sizes, and I think it is the expected behavior. It also avoids reading what could be hundreds of documents.

My implementation uses two functions: one that loads 10 documents, and another that loads the next 10 documents based on where the first set of reads ended. One challenge to this was updating the list of messages when a new message is posted (as doing this with `onSnapshot` proved difficult). This was solved with the `react-firebase-hooks` library, listening for the most recent message, and appending it to the top of the messages array, which works great.

_Improvements to this:_

Obvious next steps would be re-factoring this into its own `services` folder.

### Scheduled messages

Scheduled messages is currently implemented for scheduling messages down to the hour. I implemented this with the Ionic modal component, and a button placed to the right of the submit button.

This was actually more straightforward than pagination, although still tricky. The ionic modal allows for choosing a date in a variety of formats, but I chose the year, month, day, hour, and am/pm. I compared this to the current date at time of posting, and if it was earlier/at the same time, the message would post. If it was later, it would be put in an array in localStorage.

A setTimeout() checks this localStorage array every once and awhile to see if any messages need to be posted. In the array is the message text and the user's suggested date. If the current date is less than or equal to the requested date (after some time), the message is posted.

_Improvements to this:_

Two obvious things: scheduling down to the minute, and a more graceful way of checking localStorage for the messages.

### Final thoughts

The only thing I would change about the DB structure is adding the messages collection as a sub-collection under some sort of user collection. This would allow for more interesting behavior at a per-user basis, as well as collection-group queries (one of my favorite firestore features), which allows for making queries across all of the messages collections even if they are set up as sub-collections under the user collections. I would not make a DB collection for scheduled messages as of yet (server check >>> LS check in terms of time), but this would need to be done if the user expects to use ladder on more than just one device (also, cache can be cleared). Soon, IMO, this would be a worthwhile compromise.

In terms of learning things, I had never used `.startAfter()` query parameter for firestore yet. This was needed for pagination and starting a query for documents after some previous document. I think my solution works really well here, as it prevents a lot of excessive reads, but readability took a hit, which would be my next big improvement to this.

In term of improvements, I would love to see a messageBoard populated by more than one user and user authentication. This would allow for some interesting filters. On top of this, maybe a rich-text message board? Images? File upload? The challenge is great as it is but those would be some cool extra-credit features :).

As a bonus I also added a service worker. Some more work here could be done (webpack, SSR, custom icons and splash screens, and ionic capacitor for rendering webview-powered native apps).
