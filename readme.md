# λ Lamda

A browser based desktop environment including several default apps.
Built with web technologies.

<small>
  <a href="http://www.danielmoth.com/Blog/lambda-Vs-Lamda.aspx">
    Yes, lamda without a "b"
  </a>
<small>


## Features

- **Batteries included** -
    Contains apps and services for most common computing needs.

- **File based** -
    All apps are required to only store and retrieve data as (plaintext) files
    in their assigned storage directory.

- **Easily installable** -
    Download the binary, execute it, open your browser. 🚀

- **Effective** -
    Made for power users.
    No useless whitespace, no animations, and no other pointless baggage.

- **Innovative** -
    Rethinks several UI and UX patterns which we've taken for granted.
    (E.g. how a calendar is supposed to look like)


### Anti-Features

- **Window managment** -
    Already handled by your browser

- **Multi user features** -
    Does not include any rights management, comment, or collaboration features.
    However, can still be used by several people simultaneously
    if they want to work on a shared set of data.


## Apps

- Files (is default landing page)
    - Includes a basic text editor and file previewer
- Contacts
- Events (aka Calendar)
- Photos
- Books
- Movies
- Songs (aka Music)
- Tasks
- Projects
- Sheetmusic
- Things
- News (aka Feed Reader)

Planned:

- Terminal (running a shell for the underlaying computer / server)
- Mails
- Notes


## Technology

- Frontend: Elm
- Backend: Node + Express
    (Potential rewrite in Haskell or Rust in the future)


**Checkout the [whitepaper](./whitepaper.md) for a more in depth explanation**


## Ideas

- [ ] Browse files based on tags and not hierarchies
- [ ] List of bookmarklets which can be drag & dropped into new browsers
- [ ] Config to specify a list of directories each app is allowed to access
