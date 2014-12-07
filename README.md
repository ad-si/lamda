# Photos

## Schema

Photos must be saved in one of the following file structures or a combination of them.

- Events only
		photos
		├── date_event-name
		│   ├── photo-01.jpg
		│   ├── photo-02.jpg
		…
- Year directories
		photos
		├── year
		│   ├── date_event-name
		│   │   ├── photo-01.jpg
		│   │   ├── photo-02.jpg
		…
- Year & month directories
		photos
		├── year
		|   ├── month
		│   |   ├── date_event-name
		│   |   │   ├── photo-01.jpg
		│   |   │   ├── photo-02.jpg
		…
- Year, month & day directories
		photos
		├── year
		|   ├── month
		|   |   ├── day
		│   |   |   ├── event-name
		│   |   |   │   ├── photo-01.jpg
		│   |   |   │   ├── photo-02.jpg
		…

The date is always the date of the oldest photo in the collection and must have the following format: `YYYY-MM-DD` (e.g. 2014-03-27)
