## Feature breakdown

### UI

The app UI uses a mix of modified [Ionic Components](https://ionicframework.com/docs/components), and custom CSS.

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
