export class Calendar {
  kind?: string;
  etag?: string;
  summary?: string;
  description?: string;
  updated?: Date;
  timeZone?: string;
  accessRole?: string;
  defaultReminders?: any[];
  nextPageToken?: string;
  items?: Event[];

  constructor(
    kind?: string,
    etag?: string,
    summary?: string,
    description?: string,
    updated?: Date,
    timeZone?: string,
    accessRole?: string,
    defaultReminders?: any[],
    nextPageToken?: string,
    items?: Event[],
  ){
    this.kind = kind;
    this.etag = etag;
    this.summary = summary;
    this.description = description;
    this.updated = updated;
    this.timeZone = timeZone;
    this.accessRole = accessRole;
    this.defaultReminders = defaultReminders;
    this.nextPageToken = nextPageToken;
    this.items = items;
  }

  static fromMap(json?: {[key:string]: any}): Calendar {
    return json ? new Calendar(
      json["kind"],
      json["etag"],
      json["summary"],
      json["description"],
      json["updated"] ? new Date(json["updated"]) : undefined,
      json["timeZone"],
      json["accessRole"],
      json["defaultReminders"] ? Array.from(json["defaultReminders"]).map(reminder => reminder) : undefined,
      json["nextPageToken"],
      Array.from(json["items"]).map(item => Event.fromMap(item)),
    ) : undefined;
  }
}

export class Event {
  kind?: string;
  etag?: string;
  id?: string;
  status?: string;
  htmlLink?: string;
  created?: Date;
  updated?: Date;
  summary?: string;
  creator?: ItemCreator;
  organizer?: Organizer;
  start?: EventDate;
  end?: EventDate;
  transparency?: string;
  iCalUid?: string;
  sequence?: number;
  eventType?: string;
  location?: string;
  description?: string;

  constructor(
    kind?: string,
    etag?: string,
    id?: string,
    status?: string,
    htmlLink?: string,
    created?: Date,
    updated?: Date,
    summary?: string,
    creator?: ItemCreator,
    organizer?: Organizer,
    start?: EventDate,
    end?: EventDate,
    transparency?: string,
    iCalUid?: string,
    sequence?: number,
    eventType?: string,
    location?: string,
    description?: string
  ) {
    this.kind = kind;
    this.etag = etag;
    this.id = id;
    this.status = status;
    this.htmlLink = htmlLink;
    this.created = created;
    this.updated = updated;
    this.summary = summary;
    this.creator = creator;
    this.organizer = organizer;
    this.start = start;
    this.end = end;
    this.transparency = transparency;
    this.iCalUid = iCalUid;
    this.sequence = sequence;
    this.eventType = eventType;
    this.location = location;
    this.description = description;
  }

  static fromMap(json? : {[key:string]:any}) {
    return json ? new Event(
      json["kind"],
      json["etag"],
      json["id"],
      json["status"],
      json["htmlLink"],
      new Date(json["created"]),
      new Date(json["updated"]),
      json["summary"],
      ItemCreator.fromMap(json["creator"]),
      Organizer.fromMap(json["organizer"]),
      EventDate.fromMap(json["start"]),
      EventDate.fromMap(json["end"]),
      json["transparency"],
      json["iCalUID"],
      json["sequence"],
      json["eventType"],
      json["location"],
      json["description"],
    ) : undefined;
  }
}

class ItemCreator {
  email? : string;
  displayName? : string;

  constructor(email?: string, displayName?: string) {
    this.email = email;
    this.displayName = displayName;
  }

  static fromMap(json?: {[key: string]: any}): ItemCreator {
    return json ? new ItemCreator(
      json["email"],
      json["displayName"],
    ) : undefined;
  }
}

class EventDate {
  date?: Date;
  dateTime?: Date;

  constructor(date?: Date, dateTime?: Date) {
    this.date = date;
    // Ignore timezone offset.
    // Example:
    // "2021-08-22T19:00:00-05:00" ignore "-05:00"
    this.dateTime = dateTime ? new Date(dateTime.getTime() - (dateTime.getTimezoneOffset() * 60000)) : undefined;
  }
  
  static fromMap(json?: {[key: string]: any}): EventDate {
    const date: Date = new Date(json["dateTime"]);
    console.log(json["dateTime"]);
    console.log(date);
    console.log(date ? date.getTimezoneOffset() * 60000 : undefined);
    console.log(date ? new Date(date.getTime() - (date.getTimezoneOffset() * 60000)) : undefined);
    return json ? new EventDate(
      json["date"] ? new Date(json["date"]) : undefined,
      json["dateTime"] ? new Date(json["dateTime"]) : undefined,
    ) : undefined;
  }
}

class Organizer {
    email?: string;
    self?: boolean;

  constructor(email?: string, self?: boolean) {
    this.email = email;
    this.self = self;
  }

  static fromMap(json?: {[key: string]: any}): Organizer {
    return json ? new Organizer(
      json["email"],
      json["self"],
    ) : undefined;
  }
}
