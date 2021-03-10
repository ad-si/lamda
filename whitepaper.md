# Lamda - A browser based desktop environment built with web technologies

## Structure

Operating system must handle data.

- Storing
- Logging
- Viewing
- Grouping
- Accessing
- Providing
- Using / Executing

Or same concept, but with focus on aspects of data:

- Spatial - Order of data on the storage medium
- Temporal - Change of data over time
- Informational - Information contained in the data
- Relational - Relation to other data
- Accessibility - Rights to access data
- Reachability - Existence of infrastructure to reach data
- Functional - Purpose of the data


Until now:

- Nodes
  - Files
  - Directories
- Apps
  - Databases

Usage:
Files must be added to apps which store the data in their own databases.
In order to retrieve the data user has to export data from apps
(which might not always be possible)


Better:

- Data containers
  - Data
  - Metadata
- Filters (aka queries, aka views, aka selections)
- Apps

Usage:
User defines via filters which data apps can access.
Apps operate always on the file system data.

This has several advantages:

- Apps can be switched without problems
- No need to export data and user always stays in control
- The filesystem is the API
- Apps get a filtered subset of users data
  - Full control of what apps are able to access
- No closed databases

This is better, because files are too low level,
which causes following problems:

- Overlap of id and name
- File extensions
- Directories try to improve things but are actually just namespaces
- No difference between data and program
- No difference between text and binary
- No system level meta data

The file system is actually just a list of files (with the notion of namespaces)

Data Containers:
- Set of UDCs (Universal Data Container) entities
  - Directory containing a data.yaml and all binary assets (e.g. MP3s, JPEGs, thumbnails, …)
- No name (Name is UUID)
- No order
- No hierarchy
- But creation time stamp! (Times stamps are also great IDs => no more overlap of id and name)
  => Enables links between documents which can't break (unlike file-paths)


Every app is actually just a (text) editor.
It modifies and views content of files.


Like browsers solves common problems

browser -> Common rendering engine
Lamda -> Common data management

That's why operating systems exist in the first place: To solve common problems

- Process management
- Data management
- Rights management
- ...

How about solving another (more high level) common problem:
Information management

...or make databases a OS level feature like file systems


Versioning/History is a First class Citizen:

- Documents Link to pre-/successor
- Everytime a file is opened, a clone is generated
- Maybe make files even immutable


## Window Management

- There should only be one kind of window / pane / tab.
- Should be a system level feature

Current situation:

Imagine you want to edit 2 files with vim:

1. Two terminal windows
1. Two terminal Tabs
1. Two terminal Panes
1. Two tmux sessions
1. Two tmux windows
1. Two tmux panes
1. Two vim tabs
1. Two vim buffers
1. Two processes

Stick to the UNIX principle: **Do one thing and to it well!**


## Paradigms

> Separators are bad => Always prefer terminators

- Adding items doesn't change two lines (especially good for versioning)
- No more "Is it the end of the item or did the transmission fail?"
- Consistent look
- easier copy & pasting


## Character Set

Replace Unicode with Huffman encoded character set

Pros:

- Every bit-string has a plain text representation
- Storage of textual data is more efficient
- Unlimited extensibility

Cons:

- Characters have different storage sizes


## Files

- Every line in a file must end with eol (end of line) line terminator
- Every file must end with a eof (end of file) character
  (=> no 0 bit files, as file has at least a eof character)
  … or a file which ends with a newline character is a text file
  and evertyhing else is a binary file

Linux: Everything is a file
Lamda: Everything is a text file (=> Need a different encoding than Unicode)

=>
No concept of binary or human unreadable files,
but human intelligible and unintelligible

Maybe: No difference between directories and files!
Every node can have (meta)data and children.

Necessary meta-data:

```yaml
uuid: 123e4567-e89b-12d3-a456-426655440000
 # uuid contains creation timestamp with nanoseconds resolution
contentHash: baec2cd5d57d243512c8dc1ee28cfb22
```

Different apps might use the `uuid` or the `contentHash` as id.
(Either the creation time or the content is important)


## Tags

- [Designing better file organization around tags not hierarchies][nayuki.io]
- [TagSpaces] - Cross-platform file browser
    organizing files and folders with tags and colors

[TagSpaces]: https://www.tagspaces.org/
[nayuki.io]:
  https://www.nayuki.io/page/designing-better-file-organization-around-tags-not-hierarchies


### Related

- [Vfile] - Virtual file format for text processing.

[Vfile]: https://github.com/vfile/vfile


### Hierarchy

- Lamda root directory / home directory
  - Images
  - Things
  - < object + plural "s" >

Objects directories can contain:

- YAML files (timestamp name is recommended)
  - Plain key-value map
  - Eventlang file (every key must be a valid timestamp / range / `?`)
- Directories with timestamp name
  - `data.yaml` and content / binary files
- Directory hierarchies like `year/month/day/time(.yaml)?`


## Related

- [Tagspaces](https://tagspaces.org)
- [Sandstorm](https://sandstorm.io)
- [x] - Desktop environment in the browser
- [Just Another Desktop Environment][jde] -
    Linux desktop environment built with HTML, CSS, JavaScript, and Python.

[jde]: https://github.com/codesardine/jde
[x]: https://github.com/DustinBrett/x
