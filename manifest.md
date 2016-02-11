# Lamda Manifest

## Structure

OS must satisfy 3 needs:

- Storage
- Logging
- Viewing

Or same concept, but different names

- Spatial (still looking for a better word)
- Temporal
- Relational


Until now:

- (Nodes)
- (Files)
- Directories
- Apps
  - Databses


Better:


Because files are too low level:

- No more overlap of id and name
- No more file extensions
- Directories try to improve things but are actually just namespaces
- No difference between data and program

- Documents
- Filters (Aka queries)
- Views

The file system is actually just a list of files (with the notion of namespaces)

Documents:
- Set of udf (universal data format) entities
  - Directory containing a main.yaml and all binary assets (e.g. MP3s, JPEGs, thumbnails, ...)
- No name (Name is UUID)
- No order
- No hierarchy
- But creation time stamp! (Times stamps are also great IDs => no more overlap of id and name)
- Links between documents which can't break like file-paths


Every app is actually just a (text) editor -> modifies content of files


Like browsers solves common problems

browser -> Common rendering engine
Lamda -> Common data management

That's why operating systems exist in the first place: To solve common problems

- Process management
- Data management
- Rights management
- ...

How about solving another (more high level) common problem: Information management

...or make databases a OS level feature like file systems


Versioning/History is a First class Citizen:

- Documents Link to pre-/successor
- everytime a file is opened, a clone is generated
- Maybe make files even immutable


## Window Management

There should only be one kind of window / pane / tab and only.
At the moment:

Imagine you want to edit 2 files with vim:

1. Two iTerm windows
1. Two iTerm Tabs
1. Two iTerm Panes
1. Two tmux windows
1. Two vim tabs
1. Two vim buffers
1. Two processes

Stick to the UNIX principle: Do one thing and to it well!
